return (
    <div>
      <Button
        type="primary"
        onClick={() => setFormVisible(!formVisible)}
        style={{ marginBottom: "20px" }}
      >
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
            {Array.from({ length: reportCount }).map((_, index) => {
              return (
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
                      {/* Datum reportu */}
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
  
                      {/* Výpočet trasy */}
                      <Card
                        title="Výpočet trasy z firmy na zakázku"
                        style={{ marginBottom: "20px" }}
                      >
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
                                icon={{
                                  url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                                }}
                              />
                            )}
                            {selectedPositions.to && (
                              <Marker
                                position={selectedPositions.to}
                                label="Cíl"
                                icon={{
                                  url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                }}
                              />
                            )}
                            {infoWindow && (
                              <InfoWindow
                                position={infoWindow.position}
                                onCloseClick={() => setInfoWindow(null)} // Zavření InfoWindow
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                  }}
                                >
                                  <Button
                                    onClick={() => handleSelect("from")}
                                    style={{
                                      marginBottom: "10px",
                                      fontSize: "12px",
                                      padding: "10px",
                                    }}
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
                          <Card
                            title="Výsledek"
                            style={{ marginTop: "10px", background: "#f9f9f9" }}
                          >
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
                          <p>
                            <b>Jméno:</b> {selectedClient.name}
                          </p>
                          <p>
                            <b>Adresa:</b> {selectedClient.address || "Nezadána"}
                          </p>
                          <p>
                            <b>OP:</b> {selectedClient.opCode || "Klient nemá přidělený OP"}
                          </p>
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
              );
            })}
          </Tabs>
        </>
      )}
    </div>
  );