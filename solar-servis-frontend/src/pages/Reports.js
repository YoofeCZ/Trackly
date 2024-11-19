import React, { useState, useEffect } from "react";
import { Form, Input, DatePicker, Select, Button, message, Card } from "antd";
import { createReport, getClients } from "../services/api";
import "../css/Report.css";
import { GoogleMap, LoadScriptNext, Marker, InfoWindow } from "@react-google-maps/api";
import superagent from "superagent";

const { Option } = Select;

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const CreateReportWithMap = () => {
  const [clients, setClients] = useState([]);
  const [travelCost, setTravelCost] = useState(0);
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
  const [selectedPositions, setSelectedPositions] = useState({ from: null, to: null });
  const [infoWindow, setInfoWindow] = useState(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 49.898930200073266, lng: 18.184307767779885 });
  const [travelResult, setTravelResult] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(null); // Čas příjezdu
const [leaveTime, setLeaveTime] = useState(null);     // Čas odjezdu
const [workCost, setWorkCost] = useState(0);          // Náklady za práci
const hourlyRate = 1500;                              // Cena za hodinu práce

const calculateWorkCost = () => {
  if (arrivalTime && leaveTime) {
    const durationInMinutes = (leaveTime - arrivalTime) / (1000 * 60); // Rozdíl v minutách
    const cost = (durationInMinutes / 60) * hourlyRate; // Převod na hodiny a výpočet ceny
    setWorkCost(cost);
  }
};

useEffect(() => {
  calculateWorkCost();
}, [arrivalTime, leaveTime]);

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

  const handleMapRightClick = (event) => {
    const coordinates = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
  
    console.log("Right-click coordinates:", coordinates); // Logujeme kliknutí
  
    // Zavřeme stávající InfoWindow
    setInfoWindow(null);
  
    // Nastavíme nové InfoWindow
    setTimeout(() => {
      setInfoWindow({ position: coordinates });
      console.log("Current infoWindow state:", { position: coordinates }); // Logujeme nový stav
    }, 0);
  };
  
  
  
  

  const handleSelect = (type) => {
    if (type === "from") {
      setSelectedPositions({ ...selectedPositions, from: infoWindow.position });
    } else if (type === "to") {
      setSelectedPositions({ ...selectedPositions, to: infoWindow.position });
    }
    setInfoWindow(null);
  };

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
        setMapCenter(location);
      } else {
        message.error("Adresa nebyla nalezena, zkuste zadat konkrétnější adresu.");
      }
    } catch (error) {
      console.error("Chyba při vyhledávání adresy:", error);
      message.error("Nastala chyba při vyhledávání adresy. Zkuste to prosím znovu.");
    }
  };

  const handleCalculateRoute = () => {
    return new Promise((resolve, reject) => {
      if (selectedPositions.from && selectedPositions.to) {
        superagent
          .get("http://localhost:5000/api/distance")
          .query({
            origins: `${selectedPositions.from.lat},${selectedPositions.from.lng}`,
            destinations: `${selectedPositions.to.lat},${selectedPositions.to.lng}`,
          })
          .then((response) => {
            if (response.body && response.body.rows?.length > 0) {
              const result = response.body.rows[0].elements[0];
              if (result.status === "OK") {
                const travelData = {
                  distance: (result.distance.value / 1000) * 2,
                  duration: (result.duration.value / 60) * 2,
                };
  
                setTravelResult(travelData);
                resolve(travelData); // Vyřeš promisu s výsledkem
              } else {
                reject("Nelze vypočítat trasu.");
              }
            } else {
              reject("Neplatná odpověď serveru.");
            }
          })
          .catch((error) => {
            reject("Chyba při volání API: " + error.message);
          });
      } else {
        reject("Chybí pozice start nebo cíl.");
      }
    });
  };
  

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

  const handleJobChange = (index, field, value) => {
    const newJobs = [...jobs];
    newJobs[index][field] = value;
    setJobs(newJobs);
  };

  const removeJob = (index) => {
    setJobs(jobs.filter((_, i) => i !== index));
  };

  const handleCalculateRouteAndCosts = async () => {
    try {
      const travelData = await handleCalculateRoute(); // Počkej na výpočet trasy
      console.log("Travel data:", travelData);
  
      // Výpočet cestovních nákladů
      if (travelData) {
        const { distance, duration } = travelData;
        const travelCostValue = distance * 8 + (duration / 60) * 100; // 8 Kč/km a 100 Kč/hod
        setTravelCost(travelCostValue);
  
        console.log("Calculated travel cost:", travelCostValue);
      }
    } catch (error) {
      message.error("Chyba: " + error);
    }
  };
  
  
  const handleSubmit = async (values) => {
    try {
      console.log("Travel result in handleSubmit:", travelResult);
  
      // Výpočet nákladů na práci
      let workCost = 0;
      jobs.forEach((job) => {
        if (job.arrivalTime && job.leaveTime) {
          const arrival = new Date(job.arrivalTime);
          const leave = new Date(job.leaveTime);
          const durationInMinutes = (leave - arrival) / (1000 * 60); // Rozdíl v minutách
          workCost += (durationInMinutes / 60) * 1500; // Převod na hodiny a výpočet ceny
        }
      });
  
      // Výpočet cestovních nákladů
      let travelCostValue = 0;
      if (travelResult) {
        const { distance, duration } = travelResult;
  
        // Logování jednotlivých částí výpočtu
        console.log("Distance:", distance);
        console.log("Duration:", duration);
  
        travelCostValue += distance * 8; // 8 Kč za kilometr
        travelCostValue += (duration / 60) * 100; // 100 Kč za hodinu na cestě
  
        console.log("Travel cost value:", travelCostValue);
      }
      setTravelCost(travelCostValue); // Uložení cestovních nákladů do stavu
      console.log("Final travel cost:", travelCost);
  
      // Přidání popisu práce (notes)
      const reportData = {
        ...values,
        notes: values.notes, // Přidání notes do dat
        departureTime: values.departureTime?.toISOString(),
        returnTime: values.returnTime?.toISOString(),
        jobs: jobs.map((job) => ({
          ...job,
          arrivalTime: job.arrivalTime?.toISOString(),
          leaveTime: job.leaveTime?.toISOString(),
        })),
        totalWorkCost: workCost.toFixed(2), // Celkové náklady na práci
        totalTravelCost: travelCostValue.toFixed(2), // Celkové cestovní náklady
      };
  
      await createReport(reportData);
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
    <div>
      <Card title="Výpočet trasy z firmy na zakázku" style={{ marginBottom: "20px" }}>
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
            center={mapCenter}
            zoom={12}
            onRightClick={handleMapRightClick}
            options={{ gestureHandling: "greedy" }}
          >
            {selectedPositions.from && (
              <Marker
                position={selectedPositions.from}
                label="Začátek"
                icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }}
              />
            )}
            {selectedPositions.to && (
              <Marker
                position={selectedPositions.to}
                label="Cíl"
                icon={{ url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
              />
            )}
{infoWindow && (
  <InfoWindow
    position={infoWindow.position}
    onCloseClick={() => setInfoWindow(null)} // Zavření InfoWindow
  >
    <div style={{ display: "flex", flexDirection: "column", alignItems: "upcenter" }}>
      <Button
        onClick={() => handleSelect("from")}
        style={{ marginBottom: "10px", fontSize: "12px", padding: "10px" }}
      >
        Nastavit jako začátek
      </Button>
      <Button
        onClick={() => handleSelect("to")}
        style={{ fontSize: "12px", padding: "10px" }}
      >
        Nastavit jako cíl
      </Button>
      <Button
        onClick={() => handleSelect("to")}
        style={{ fontSize: "20px", padding: "50px" }}
      >
        
      </Button>
    </div>
  </InfoWindow>
)}




          </GoogleMap>
        </LoadScriptNext>

        <div style={{ marginTop: "10px" }}>
  <Button
    type="primary"
    onClick={handleCalculateRouteAndCosts}
    disabled={!selectedPositions.from || !selectedPositions.to}
  >
    Vypočítat trasu a cestovní náklady
  </Button>
</div>


        {travelResult && (
          <Card title="Výsledek" style={{ marginTop: "10px", background: "#f9f9f9" }}>
            <p>Vzdálenost tam a zpět: {travelResult.distance.toFixed(2)} km</p>
            <p>Čas tam a zpět: {travelResult.duration.toFixed(1)} minut</p>
          </Card>
        )}
      </Card>

      <Card title="Formulář Reportu">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="opCode"
            label="OP (Obchodní případ)"
            rules={[{ required: true, message: "Zadejte OP" }]}
          >
            <Input placeholder="Zadejte OP (např. OP-123-456)" />
          </Form.Item>
          <Form.Item label="Čas příjezdu na zakázku">
  <DatePicker
    showTime
    format="YYYY-MM-DD HH:mm"
    onChange={(value) => setArrivalTime(value?.toDate())} // Aktualizace příjezdu
  />
</Form.Item>

<Form.Item label="Čas odjezdu ze zakázky">
  <DatePicker
    showTime
    format="YYYY-MM-DD HH:mm"
    onChange={(value) => setLeaveTime(value?.toDate())} // Aktualizace odjezdu
  />
</Form.Item>
<Form.Item label="Cena za práci">
  <p>{workCost.toFixed(2)} Kč</p>
</Form.Item>
<Form.Item label="Cestovní náklady">
  <p>{travelCost.toFixed(2)} Kč</p>
</Form.Item>
<Form.Item
  name="notes"
  label="Popis práce"
  rules={[{ required: true, message: "Zadejte popis práce" }]}
>
  <Input.TextArea placeholder="Popište, co bylo provedeno na zakázce" rows={4} />
</Form.Item>
<Form.Item>
            <Button type="primary" htmlType="submit">
              Odeslat
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateReportWithMap;
