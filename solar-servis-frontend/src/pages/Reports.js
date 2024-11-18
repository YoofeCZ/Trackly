import React, { useState, useEffect,useRef } from "react";
import { Form, Input, DatePicker, Select, Button, message } from "antd";
import { createReport, getClients } from "../services/api";
import axios from "axios";
import "../css/Report.css";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = "sk.eyJ1IjoieW9vZmVjIiwiYSI6ImNtM25pbmVibTE0dm0yaXF6Yzc0bTVuYzEifQ.cEcmM8ag0uxK9meBserqSg";

const { Option } = Select;

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const CreateReportForm = () => {
  const calculateTravelTimeForJobs = async () => {
    const updatedJobs = [...jobs];
    for (let i = 0; i < jobs.length - 1; i++) {
      const from = jobs[i].addressCoordinates; // Startovní souřadnice zakázky
      const to = jobs[i + 1].addressCoordinates; // Cílové souřadnice další zakázky
  
      if (from && to) {
        const travelData = await calculateTravelTime(from, to);
        updatedJobs[i].travelTimeToNext = travelData.duration; // Přidáme čas přejezdu
        updatedJobs[i].distanceToNext = travelData.distance; // Přidáme vzdálenost
      }
    }
    setJobs(updatedJobs); // Aktualizujeme zakázky
  };
  
  const [clients, setClients] = useState([]);
  const [form] = Form.useForm();
  const [jobs, setJobs] = useState([
    {
      description: "",
      materials: "",
      clientId: null,
      address: "",
      arrivalTime: null,
      leaveTime: null,
      travelTimeToNext: null,
    },
  ]);
  const AddressPicker = ({ onAddressSelect }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);

    useEffect(() => {
      if (!map.current) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [14.42076, 50.08804], // Výchozí souřadnice (Praha)
          zoom: 12,
        });
  
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: true,
          placeholder: "Vyhledejte adresu",
        });
  
        map.current.addControl(geocoder);
  
        geocoder.on("result", (e) => {
          const coordinates = e.result.center;
          onAddressSelect(coordinates); // Po výběru adresy vrátíme souřadnice
        });
      }
    }, [onAddressSelect]); // Přidáno jako závislost);
  
    return <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />;
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        message.error("Chyba při načítání klientů.");
      }
    };

    fetchClients();
  }, []);

  const addJob = () => {
    setJobs([
      ...jobs,
      {
        description: "",
        materials: "",
        clientId: null,
        address: "",
        arrivalTime: null,
        leaveTime: null,
        travelTimeToNext: null,
      },
    ]);
  };

  const handleAddressSelect = (index, coordinates) => {
    const newJobs = [...jobs];
    newJobs[index].addressCoordinates = coordinates; // Přidáme souřadnice
    setJobs(newJobs);
  };
  
  const removeJob = (index) => {
    setJobs(jobs.filter((_, i) => i !== index));
  };

  const handleJobChange = (index, field, value) => {
    const newJobs = [...jobs];
    newJobs[index][field] = value;
    setJobs(newJobs);
  };

  const calculateTravelTime = async (from, to) => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from};${to}?access_token=${MAPBOX_TOKEN}`;
      const response = await axios.get(url);
      const route = response.data.routes[0];
      return {
        distance: route.distance / 1000, // Kilometry
        duration: route.duration / 60, // Minuty
      };
    } catch (error) {
      console.error("Chyba při výpočtu vzdálenosti a času:", error);
      return { distance: 0, duration: 0 };
    }
  };

  const handleSubmit = async (values) => {
    try {
      await calculateTravelTimeForJobs(); // Spočítáme časy a vzdálenosti mezi zakázkami
  
      const reportData = {
        ...values,
        departureTime: values.departureTime?.toISOString(),
        returnTime: values.returnTime?.toISOString(),
        jobs: jobs.map((job) => ({
          ...job,
          arrivalTime: job.arrivalTime?.toISOString(),
          leaveTime: job.leaveTime?.toISOString(),
        })),
      };
  
      await createReport(reportData); // Odeslání reportu
      message.success("Report byl úspěšně vytvořen!");
      form.resetFields();
      setJobs([
        {
          description: "",
          materials: "",
          clientId: null,
          address: "",
          arrivalTime: null,
          leaveTime: null,
          travelTimeToNext: null,
        },
      ]);
    } catch (error) {
      message.error("Chyba při vytváření reportu.");
    }
  };
  

  return (
    <div className="report-form">
      <h2>Vytvořit nový report</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="opCode"
          label="OP (Obchodní případ)"
          rules={[
            { required: true, message: "Zadejte OP" },
            {
              pattern: /^[A-Z]{2}-\d{3}-\d{3}$/,
              message: "OP musí být ve formátu OP-123-456",
            },
          ]}
        >
          <Input placeholder="Zadejte OP (např. OP-123-456)" />
        </Form.Item>

        <Form.Item
          name="departureAddress"
          label="Adresa odjezdu z firmy"
          rules={[{ required: true, message: "Zadejte adresu odjezdu" }]}
        >
          <div style={{ height: "400px" }}>
            <AddressPicker
              onAddressSelect={(coordinates) =>
                handleJobChange(0, "departureAddress", coordinates)
              }
            />
          </div>
        </Form.Item>

        <Form.Item
          name="departureTime"
          label="Čas odjezdu"
          rules={[{ required: true, message: "Zadejte čas odjezdu" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>

        <Form.Item
          name="returnTime"
          label="Čas návratu na firmu"
          rules={[{ required: true, message: "Zadejte čas návratu" }]}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>

        <h3>Zakázky</h3>
        {jobs.map((job, index) => (
          <div key={index} className="job-section">
            <Form.Item
              label={`Popis zakázky ${index + 1}`}
              rules={[{ required: true, message: "Zadejte popis zakázky" }]}
            >
              <Input
                placeholder="Popis zakázky"
                value={job.description}
                onChange={(e) =>
                  handleJobChange(index, "description", e.target.value)
                }
              />
            </Form.Item>

            <Form.Item
              label="Adresa zakázky"
              rules={[{ required: true, message: "Zadejte adresu zakázky" }]}
            >
              <div style={{ height: "400px" }}>
                <AddressPicker
                  onAddressSelect={(coordinates) =>
                    handleJobChange(index, "address", coordinates)
                  }
                />
              </div>
            </Form.Item>

            <Form.Item
              label="Čas příjezdu"
              rules={[{ required: true, message: "Zadejte čas příjezdu" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                onChange={(value) =>
                  handleJobChange(index, "arrivalTime", value)
                }
              />
            </Form.Item>

            <Form.Item
              label="Čas odjezdu"
              rules={[{ required: true, message: "Zadejte čas odjezdu" }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                onChange={(value) =>
                  handleJobChange(index, "leaveTime", value)
                }
              />
            </Form.Item>

            <Form.Item
              label="Materiály"
              extra="Zadejte materiály ve formátu: Jméno (Množství, Cena)"
            >
              <Input.TextArea
                placeholder="Např. Kabel (10m, 100 Kč)"
                value={job.materials}
                onChange={(e) =>
                  handleJobChange(index, "materials", e.target.value)
                }
              />
            </Form.Item>

            <Form.Item label="Klient">
              <Select
                placeholder="Vyberte zákazníka"
                value={job.clientId}
                onChange={(value) =>
                  handleJobChange(index, "clientId", value)
                }
              >
                {clients.map((client) => (
                  <Option key={client.id} value={client.id}>
                    {client.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {index > 0 && (
              <Button danger onClick={() => removeJob(index)}>
                Odebrat zakázku
              </Button>
            )}
          </div>
        ))}
        <Button type="dashed" onClick={addJob}>
          Přidat další zakázku
        </Button>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Vytvořit report
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateReportForm;
