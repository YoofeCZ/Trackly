import React, { useState, useEffect } from "react";
import { Form, Input, DatePicker, Select, Button, message } from "antd";
import { createReport, getClients } from "../services/api";
import "../css/Report.css";
import { GoogleMap, LoadScriptNext, Marker, InfoWindow } from "@react-google-maps/api";
import superagent from "superagent";


const { Option } = Select;

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
console.log(GOOGLE_MAPS_API_KEY); // Přidáno pro kontrolu, že klíč je správně načten


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
  
  // Definice funkce pro výpočet trasy mezi body
  const handleCalculateTravelData = async (from, to) => {
    try {
      const response = await calculateTravelTime(from, to);
      message.success(`Trasa: ${response.distance} km, Čas: ${response.duration} minut`);
    } catch (error) {
      message.error("Chyba při výpočtu trasy. Zkuste to prosím znovu.");
    }
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
  const AddressPicker = ({ onTravelDataCalculate }) => {
    const [selectedPositions, setSelectedPositions] = useState({
      from: null,
      to: null,
    });
    const [infoWindow, setInfoWindow] = useState(null);
    const [addressQuery, setAddressQuery] = useState("");
    const [mapCenter, setMapCenter] = useState({ lat: 49.898930200073266, lng: 18.184307767779885 });
  
    // Funkce pro pravé kliknutí na mapě
    const handleMapRightClick = (event) => {
      const coordinates = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
  
      // Zobrazíme InfoWindow na pozici pravého kliknutí
      setInfoWindow({
        position: coordinates,
      });
    };
  
    // Funkce pro nastavení bodu jako začátek nebo cíl
    const handleSelect = (type) => {
      if (type === "from") {
        setSelectedPositions({ ...selectedPositions, from: infoWindow.position });
      } else if (type === "to") {
        setSelectedPositions({ ...selectedPositions, to: infoWindow.position });
      }
  
      // Skryjeme InfoWindow po výběru
      setInfoWindow(null);
    };
  
    // Funkce pro zpracování vyhledávání adresy
    const handleAddressSubmit = async () => {
      try {
        const response = await superagent
          .get("https://maps.googleapis.com/maps/api/geocode/json")
          .query({
            address: addressQuery,
            key: GOOGLE_MAPS_API_KEY,
          });
  
        const location = response.body.results[0]?.geometry.location;
  
        if (location) {
          setMapCenter(location); // Posuneme mapu na vyhledávané místo bez označení jako začátek nebo cíl
        } else {
          message.error("Adresa nebyla nalezena, zkuste zadat konkrétnější adresu.");
        }
      } catch (error) {
        console.error("Chyba při vyhledávání adresy:", error);
        message.error("Nastala chyba při vyhledávání adresy. Zkuste to prosím znovu.");
      }
    };
  
    // Funkce pro výpočet trasy
    const handleCalculateRoute = () => {
      if (selectedPositions.from && selectedPositions.to) {
        onTravelDataCalculate(selectedPositions.from, selectedPositions.to);
      } else {
        message.error("Prosím nastavte začátek a cíl trasy.");
      }
    };
  
    return (
      <>
        <div style={{ marginBottom: "10px" }}>
          <Input
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            placeholder="Zadejte adresu (např. Václavské náměstí, Praha)"
            style={{ width: "70%", marginRight: "10px" }}
          />
          <Button type="primary" onClick={handleAddressSubmit}>
            Najít adresu
          </Button>
        </div>
  
        <LoadScriptNext googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "400px" }}
            center={mapCenter} // Používáme mapCenter pro změnu středu mapy
            zoom={12}
            onRightClick={handleMapRightClick} // Použijeme onRightClick místo onClick
            options={{ gestureHandling: "greedy" }} // Povolit přiblížení a interakce na mobilu
          >
            {/* Značka pro začátek */}
            {selectedPositions.from && (
              <Marker
                position={selectedPositions.from}
                label="Začátek"
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                }}
              />
            )}
            {/* Značka pro cíl */}
            {selectedPositions.to && (
              <Marker
                position={selectedPositions.to}
                label="Cíl"
                icon={{
                  url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                }}
              />
            )}
  
            {/* InfoWindow pro nastavení bodu jako začátek nebo cíl */}
            {infoWindow && (
              <InfoWindow position={infoWindow.position} onCloseClick={() => setInfoWindow(null)}>
                <div>
                  <Button onClick={() => handleSelect("from")} style={{ marginBottom: "5px" }}>
                    Nastavit jako začátek
                  </Button>
                  <br />
                  <Button onClick={() => handleSelect("to")}>Nastavit jako cíl</Button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScriptNext>
  
        {/* Tlačítko pro výpočet trasy */}
        <div style={{ marginTop: "10px" }}>
          <Button
            type="primary"
            onClick={handleCalculateRoute}
            disabled={!selectedPositions.from || !selectedPositions.to}
          >
            Vypočítat trasu
          </Button>
        </div>
      </>
    );
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


  const calculateTravelTime = async (from, to) => {
    try {
      // Použijeme proxy server běžící na portu 5000
      console.log(`Výpočet vzdálenosti mezi: ${from.lat},${from.lng} a ${to.lat},${to.lng}`);
      
      const response = await superagent
        .get("http://localhost:5000/api/distance")
        .query({
          origins: `${from.lat},${from.lng}`,
          destinations: `${to.lat},${to.lng}`,
        });
  
      console.log('Odpověď serveru:', response.body);
  
      // Zkontrolujeme, zda odpověď obsahuje očekávanou strukturu
      if (response.body && response.body.rows && response.body.rows.length > 0) {
        const result = response.body.rows[0].elements[0];
        if (result && result.status === 'OK') {
          return {
            distance: result.distance.value / 1000, // Převod na kilometry
            duration: result.duration.value / 60,   // Převod na minuty
          };
        } else {
          console.error("Chyba: Neplatný výsledek vzdálenosti nebo času.", result);
          return { distance: 0, duration: 0 };
        }
      } else {
        console.error("Chyba: Odpověď Google API neobsahuje očekávaná data.", response.body);
        return { distance: 0, duration: 0 };
      }
    } catch (error) {
      console.error("Chyba při výpočtu vzdálenosti a času:", error.response ? error.response.text : error);
      return { distance: 0, duration: 0 };
    }
  };
  
  
  
  
  


  const handleJobChange = (index, field, value) => {
    const newJobs = [...jobs];
    newJobs[index][field] = value;
    setJobs(newJobs);
  };
  
  const removeJob = (index) => {
    setJobs(jobs.filter((_, i) => i !== index));
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
          label="Zadejte Adresu pro vyhledávání, nebo použíjte mapu"
          rules={[{ required: true, message: "Zadejte adresu kterou hledáte" }]}
        >
          <div style={{ height: "400px" }}>
            <AddressPicker
              onAddressSelect={(coordinates) =>
                handleJobChange(0, "departureAddress", coordinates)
              }
              onTravelDataCalculate={handleCalculateTravelData} // Přidáno pro tlačítko výpočtu trasy
            />
          </div>
        </Form.Item>
  
  
        {/* Čas odjezdu a návratu přesunut pod tlačítko */}
        <Form.Item
          name="departureTime"
          label="Čas odjezdu"
          rules={[{ required: true, message: "Zadejte čas odjezdu" }]}
          style={{ marginTop: "200px" }}
        >
          <DatePicker showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>
  
        <Form.Item
          name="returnTime"
          label="Čas návratu na firmu"
          rules={[{ required: true, message: "Zadejte čas návratu" }]}
          style={{ marginTop: "10px" }}
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
                  onTravelDataCalculate={handleCalculateTravelData} // Přidáno pro možnost výpočtu trasy mezi zakázkami
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
