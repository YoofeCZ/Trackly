import React, { useState, useEffect } from "react";
import { Form, Input, DatePicker, Select, Button, message, Card, Tabs, Table, InputNumber } from "antd";
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
const hourlyRate = 1500;    
// Nové stavy pro správu materiálů
const [materials, setMaterials] = useState([]); // Skladové materiály
const [selectedMaterials, setSelectedMaterials] = useState([]); // Vybrané materiály
const [customMaterials, setCustomMaterials] = useState([]); // Ručně přidané materiály        
const [chargedCost, setChargedCost] = useState(0);
const [unchargedCost, setUnchargedCost] = useState(0);                  // Cena za hodinu práce
// Stavy pro klienty a techniky
const [technicians, setTechnicians] = useState([]);
const [selectedClient, setSelectedClient] = useState(null);
const [formVisible, setFormVisible] = useState(false); // Stav pro viditelnost formuláře
const [reportCount, setReportCount] = useState(1);


// Načtení techniků z databáze
useEffect(() => {
  const fetchTechnicians = async () => {
    try {
      const response = await superagent.get("http://localhost:5000/api/technicians");
      setTechnicians(response.body);
    } catch (error) {
      message.error("Chyba při načítání techniků.");
    }
  };

  fetchTechnicians();
}, []);

const handleClientChange = (clientId) => {
  const client = clients.find((c) => c.id === clientId);
  setSelectedClient(client);
  if (client && client.opCode) {
    form.setFieldsValue({ opCode: client.opCode });
  }
};

// Funkce pro načtení materiálů ze skladu
const fetchMaterials = async () => {
  try {
    const response = await superagent.get("http://localhost:5000/api/warehouse");
    setMaterials(response.body); // Načtení skladových materiálů
  } catch (error) {
    message.error("Chyba při načítání materiálů ze skladu.");
  }
};

// Výpočet celkových nákladů materiálů
const calculateCosts = (materials, customMaterials) => {
  let totalChargedCost = 0;
  let totalUnchargedCost = 0;

  // Pro skladové materiály
  materials.forEach((material) => {
    const cost = (material.usedQuantity || 0) * material.price;
    if (material.chargeCustomer) {
      totalChargedCost += cost;
    } else {
      totalUnchargedCost += cost;
    }
  });

  // Pro vlastní materiály
  customMaterials.forEach((material) => {
    const cost = (material.quantity || 0) * material.price;
    if (material.chargeCustomer) {
      totalChargedCost += cost;
    } else {
      totalUnchargedCost += cost;
    }
  });

  setChargedCost(totalChargedCost);
  setUnchargedCost(totalUnchargedCost);
};


// Volání fetchMaterials při načtení komponenty
useEffect(() => {
  fetchMaterials();
}, []);

const handleMaterialChange = (record, field, value) => {
  const updatedMaterials = materials.map((material) =>
    material.id === record.id ? { ...material, [field]: value } : material
  );
  setMaterials(updatedMaterials);
  calculateCosts(updatedMaterials, customMaterials);
};

const handleCustomMaterialChange = (record, field, value) => {
  const updatedCustomMaterials = customMaterials.map((material) =>
    material.key === record.key ? { ...material, [field]: value } : material
  );
  setCustomMaterials(updatedCustomMaterials);
  calculateCosts(materials, updatedCustomMaterials);
};
// Celkový výpočet materiálů
const totalMaterialCost =
  selectedMaterials.reduce((sum, item) => sum + item.total, 0) +
  customMaterials.reduce((sum, item) => sum + item.total, 0);


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
  
  
  
  const handleAddCustomMaterial = () => {
    const newMaterial = {
      key: Date.now(), // Unikátní klíč
      name: "",
      price: 0,
      quantity: 0,
      chargeCustomer: false, // Výchozí hodnota pro zaúčtování
    };
    setCustomMaterials([...customMaterials, newMaterial]);
  };
  const handleRemoveCustomMaterial = (key) => {
    const updatedMaterials = customMaterials.filter((material) => material.key !== key);
    setCustomMaterials(updatedMaterials);
    calculateCosts(materials, updatedMaterials); // Přepočet nákladů
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
          workCost += (durationInMinutes / 60) * hourlyRate; // Převod na hodiny a výpočet ceny
        }
      });
  
      // Výpočet cestovních nákladů
      let travelCostValue = 0;
      if (travelResult) {
        const { distance, duration } = travelResult;
        travelCostValue += distance * 8; // 8 Kč za kilometr
        travelCostValue += (duration / 60) * 100; // 100 Kč za hodinu na cestě
      }
      setTravelCost(travelCostValue);
  
      // Materiály
      const usedMaterials = materials
        .filter((material) => material.usedQuantity > 0)
        .map((material) => ({
          id: material.id,
          name: material.name,
          quantity: material.usedQuantity,
          price: material.price,
          chargeCustomer: material.chargeCustomer,
        }));
  
      const customUsedMaterials = customMaterials
        .filter((material) => material.quantity > 0)
        .map((material) => ({
          name: material.name,
          quantity: material.quantity,
          price: material.price,
          chargeCustomer: material.chargeCustomer,
        }));
  
      const totalMaterialCost = chargedCost + unchargedCost;
  
      // Data pro odeslání
      const reportData = {
        ...values,
        reportDate: values.reportDate?.format("YYYY-MM-DD"), // Formátování datumu
        clientId: values.clientId, // Klient
        technicianId: values.technicianId, // Technik
        notes: values.notes, // Popis práce
        departureTime: values.departureTime?.toISOString(),
        returnTime: values.returnTime?.toISOString(),
        jobs: jobs.map((job) => ({
          ...job,
          arrivalTime: job.arrivalTime?.toISOString(),
          leaveTime: job.leaveTime?.toISOString(),
        })),
        materials: {
          warehouse: usedMaterials,
          custom: customUsedMaterials,
        },
        totalWorkCost: workCost.toFixed(2),
        totalTravelCost: travelCostValue.toFixed(2),
        totalMaterialCost: totalMaterialCost.toFixed(2),
      };
  
      console.log("Data odeslána na backend:", reportData);
  
      // Pokud klient nemá OP, přidělíme nové OP
      if (selectedClient && !selectedClient.opCode && values.opCode) {
        await superagent
          .post(`http://localhost:5000/api/clients/${selectedClient.id}/assign-op`)
          .send({ opCode: values.opCode });
      }
  
      // Odeslání reportu
      await createReport(reportData);
      message.success("Report byl úspěšně vytvořen!");
  
      // Reset formuláře a stavů
      form.resetFields();
      setSelectedClient(null);
      setJobs([
        {
          description: "",
          materials: "",
          clientId: null,
          address: "",
          arrivalTime: null,
          leaveTime: null,
          travelTimeToNext: null,
          reportData: null
        },
      ]);
      setMaterials([]);
      setCustomMaterials([]);
    } catch (error) {
      console.error("Chyba při vytváření reportu:", error);
      message.error("Chyba při vytváření reportu.");
    }
  };
  
  
  
  
  // Sloupce pro skladové materiály
const materialColumns = [
  {
    title: "Název materiálu",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Cena za jednotku (Kč)",
    dataIndex: "price",
    key: "price",
  },
  {
    title: "Dostupné množství",
    dataIndex: "quantity",
    key: "quantity",
  },
  {
    title: "Použité množství",
    key: "usedQuantity",
    render: (_, record) => (
      <InputNumber
        min={0}
        max={record.quantity} // Maximální hodnota
        value={record.usedQuantity || 0} // Výchozí hodnota
        onChange={(value) => handleMaterialChange(record, "usedQuantity", value)}
      />
    ),
  },
  {
    title: "Zaúčtovat zákazníkovi?",
    key: "chargeCustomer",
    render: (_, record) => (
      <input
        type="checkbox"
        checked={record.chargeCustomer || false}
        onChange={(e) =>
          handleMaterialChange(record, "chargeCustomer", e.target.checked)
        }
      />
    ),
  },
];

// Sloupce pro vlastní materiály
const customMaterialColumns = [
  {
    title: "Název materiálu",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <Input
        value={record.name || ""}
        onChange={(e) =>
          handleCustomMaterialChange(record, "name", e.target.value)
        }
      />
    ),
  },
  {
    title: "Cena za jednotku (Kč)",
    dataIndex: "price",
    key: "price",
    render: (_, record) => (
      <InputNumber
        min={0}
        value={record.price || 0}
        onChange={(value) => handleCustomMaterialChange(record, "price", value)}
      />
    ),
  },
  {
    title: "Použité množství",
    key: "quantity",
    render: (_, record) => (
      <InputNumber
        min={0}
        value={record.quantity || 0}
        onChange={(value) =>
          handleCustomMaterialChange(record, "quantity", value)
        }
      />
    ),
  },
  {
    title: "Zaúčtovat zákazníkovi?",
    key: "chargeCustomer",
    render: (_, record) => (
      <input
        type="checkbox"
        checked={record.chargeCustomer || false}
        onChange={(e) =>
          handleCustomMaterialChange(record, "chargeCustomer", e.target.checked)
        }
      />
    ),
  },
  {
    title: "Akce",
    key: "action",
    render: (_, record) => (
      <Button danger onClick={() => handleRemoveCustomMaterial(record.key)}>
        Odebrat
      </Button>
    ),
  },
];
  
return (
  <div>
    <Button type="primary" onClick={() => setFormVisible(!formVisible)} style={{ marginBottom: "20px" }}>
      {formVisible ? "Skrýt formulář" : "Zobrazit formulář"}
    </Button>
    {formVisible && (
      <>
        {/* Sekce pro nastavení počtu reportů */}
        <div style={{ marginBottom: "20px" }}>
          <span style={{ marginRight: "10px" }}>Počet reportů:</span>
          <InputNumber
            min={1}
            defaultValue={1}
            onChange={(value) => setReportCount(value || 1)} // Nastavíme počet tabů
          />
        </div>

        {/* Záložky pro každý report */}
        <Tabs defaultActiveKey="1">
          {Array.from({ length: reportCount }).map((_, index) => (
            <Tabs.TabPane tab={`Report ${index + 1}`} key={index + 1}>
              {/* Formulář pro jednotlivý report */}
              <Card title={`Formulář Reportu ${index + 1}`}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={(values) =>
                    handleSubmit({ ...values, reportIndex: index + 1 })
                  }
                >
                  <Form.Item
                    name={`reportDate_${index + 1}`}
                    label="Datum reportu"
                    rules={[{ required: true, message: "Zadejte datum reportu" }]}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      placeholder="Vyberte datum"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  {/* Sekce pro výpočet trasy */}
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
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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

                  {/* Další formulářové položky */}
                  <Form.Item
                    name={`opCode_${index + 1}`}
                    label="OP (Obchodní případ)"
                    rules={[{ required: true, message: "Zadejte OP" }]}
                  >
                    <Input placeholder="Zadejte OP (např. OP-123-456)" />
                  </Form.Item>

                  <Form.Item
                    name={`clientId_${index + 1}`}
                    label="Klient"
                    rules={[{ required: true, message: "Vyberte klienta" }]}
                  >
                    <Select placeholder="Vyberte klienta" onChange={handleClientChange}>
                      {clients.map((client) => (
                        <Select.Option key={client.id} value={client.id}>
                          {client.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {selectedClient && (
                    <Card title="Informace o klientovi" style={{ marginBottom: "20px" }}>
                      <p><b>Jméno:</b> {selectedClient.name}</p>
                      <p><b>Adresa:</b> {selectedClient.address || "Nezadána"}</p>
                      <p><b>OP:</b> {selectedClient.opCode || "Klient nemá přidělený OP"}</p>
                    </Card>
                  )}

                  <Form.Item
                    name={`technicianId_${index + 1}`}
                    label="Technik"
                    rules={[{ required: true, message: "Vyberte technika" }]}
                  >
                    <Select placeholder="Vyberte technika">
                      {technicians.map((technician) => (
                        <Select.Option key={technician.id} value={technician.id}>
                          {technician.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item label="Čas příjezdu na zakázku">
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      onChange={(value) => setArrivalTime(value?.toDate())}
                    />
                  </Form.Item>

                  <Form.Item label="Čas odjezdu ze zakázky">
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      onChange={(value) => setLeaveTime(value?.toDate())}
                    />
                  </Form.Item>

                  <Form.Item label="Cena za práci">
                    <p>{workCost.toFixed(2)} Kč</p>
                  </Form.Item>

                  <Form.Item label="Cestovní náklady">
                    <p>{travelCost.toFixed(2)} Kč</p>
                  </Form.Item>

                  <Form.Item
                    name={`notes_${index + 1}`}
                    label="Popis práce"
                    rules={[{ required: true, message: "Zadejte popis práce" }]}
                  >
                    <Input.TextArea placeholder="Popište, co bylo provedeno na zakázce" rows={4} />
                  </Form.Item>

                  <Form.Item label="Použité materiály">
                    <Card title="Skladové materiály">
                      <Table
                        dataSource={materials}
                        columns={materialColumns}
                        rowKey={(record) => record.id || record.key}
                        rowSelection={{
                          type: "checkbox",
                          onChange: (selectedRowKeys, selectedRows) =>
                            setSelectedMaterials(selectedRows),
                        }}
                        pagination={false}
                      />
                    </Card>
                    <Card title="Vlastní materiály" style={{ marginTop: 20 }}>
                      <Button
                        type="dashed"
                        onClick={handleAddCustomMaterial}
                        style={{ marginBottom: 10 }}
                      >
                        Přidat vlastní materiál
                      </Button>
                      <Table
                        dataSource={customMaterials}
                        columns={customMaterialColumns}
                        rowKey={(record) => record.id || record.key}
                        pagination={false}
                      />
                    </Card>
                    <Card title="Celkové náklady">
                      <p>Zaúčtovaná cena pro zákazníka: {chargedCost.toFixed(2)} Kč</p>
                      <p>Nezaúčtovaná cena - Servis: {unchargedCost.toFixed(2)} Kč</p>
                    </Card>
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Odeslat
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Tabs.TabPane>
          ))}
        </Tabs>
      </>
    )}
  </div>
);


  }; 



    

export default CreateReportWithMap;
