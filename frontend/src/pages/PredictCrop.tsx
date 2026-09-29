import React, { useState } from "react";

interface FormState {
  Nitrogen: string;
  Phosphorus: string;
  Potassium: string;
  Temperature: string;
  Humidity: string;
  pH_Value: string;
  Rainfall: string;
  Soil_Type_Clay: number;
  Soil_Type_Loamy: number;
  Soil_Type_Peaty: number;
  Soil_Type_Saline: number;
  Soil_Type_Sandy: number;
  Soil_Type_Silt: number;
  Variety_Arborio: number;
  Variety_Basmati: number;
  Variety_Beefsteak: number;
  Variety_Cherry: number;
  Variety_Co_0238: number;
  Variety_Co_86032: number;
  Variety_Co_99004: number;
  Variety_Dent: number;
  Variety_Durum: number;
  Variety_Flint: number;
  Variety_Hard_Red: number;
  Variety_Jasmine: number;
  Variety_Red: number;
  Variety_Roma: number;
  Variety_Russet: number;
  Variety_Soft_Red: number;
  Variety_Sweet: number;
  Variety_Yukon_Gold: number;
}

const nutrientInfo: { [key: string]: string } = {
  Nitrogen: "Nitrogen is essential for leaf growth and green coloration. Enter its current level in your soil.",
  Phosphorus: "Phosphorus supports root development and flowering. Provide its present soil value.",
  Potassium: "Potassium helps in water regulation and overall plant health. Enter its level in the soil.",
  Temperature: "Optimal temperature ensures proper crop growth. Enter the current temperature in °C.",
  Humidity: "Humidity affects transpiration and disease occurrence. Enter the current relative humidity (%).",
  pH_Value: "Soil pH affects nutrient availability. Enter the current soil pH value.",
  Rainfall: "Rainfall impacts irrigation needs. Enter recent rainfall in mm.",
};

const PredictCrop: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    Nitrogen: "", Phosphorus: "", Potassium: "", Temperature: "", Humidity: "", pH_Value: "", Rainfall: "",
    Soil_Type_Clay: 0, Soil_Type_Loamy: 0, Soil_Type_Peaty: 0, Soil_Type_Saline: 0, Soil_Type_Sandy: 0, Soil_Type_Silt: 0,
    Variety_Arborio: 0, Variety_Basmati: 0, Variety_Beefsteak: 0, Variety_Cherry: 0, Variety_Co_0238: 0,
    Variety_Co_86032: 0, Variety_Co_99004: 0, Variety_Dent: 0, Variety_Durum: 0, Variety_Flint: 0,
    Variety_Hard_Red: 0, Variety_Jasmine: 0, Variety_Red: 0, Variety_Roma: 0, Variety_Russet: 0,
    Variety_Soft_Red: 0, Variety_Sweet: 0, Variety_Yukon_Gold: 0,
  });

  const [result, setResult] = useState<string>("");

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "soil") {
      setForm({
        ...form,
        Soil_Type_Clay: value === "Clay" ? 1 : 0,
        Soil_Type_Loamy: value === "Loamy" ? 1 : 0,
        Soil_Type_Peaty: value === "Peaty" ? 1 : 0,
        Soil_Type_Saline: value === "Saline" ? 1 : 0,
        Soil_Type_Sandy: value === "Sandy" ? 1 : 0,
        Soil_Type_Silt: value === "Silt" ? 1 : 0,
      });
      return;
    }

    if (name === "variety") {
      const reset = Object.keys(form).reduce((acc: any, key) => {
        if (key.startsWith("Variety_")) acc[key] = 0;
        return acc;
      }, {});
      setForm({
        ...form,
        ...reset,
        [`Variety_${value.replace(" ", "_")}`]: 1,
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handlePredict = async () => {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setResult(data.crop);
  };

  // --- Styles ---
  const cardStyle: React.CSSProperties = { backgroundColor: "#ffffff", borderRadius: 20, padding: 25, boxShadow: "0 8px 20px rgba(0,0,0,0.1)", marginBottom: 20 };
  const inputStyle: React.CSSProperties = { width: "100%", padding: 12, borderRadius: 12, border: "1px solid #c3dec1", marginTop: 8, outline: "none" };
  const buttonStyle: React.CSSProperties = { padding: "10px 20px", borderRadius: 10, border: "none", backgroundColor: "#27ae60", color: "#fff", fontWeight: "bold", cursor: "pointer", marginLeft: 10 };
  const containerStyle: React.CSSProperties = { minHeight: "100vh", backgroundColor: "#eaf7e8", padding: 40, fontFamily: "Arial, sans-serif", display: "flex", flexDirection: "column", alignItems: "center" };
  const resultStyle: React.CSSProperties = { marginTop: 30, padding: 25, backgroundColor: "#d4f6e7", borderRadius: 20, maxWidth: 600, fontSize: 20, fontWeight: "bold", textAlign: "center", boxShadow: "0 6px 15px rgba(0,0,0,0.1)" };

  return (
    <div style={containerStyle}>
      <div style={{ width: "100%", maxWidth: 600, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ color: "#1c3c1d", fontSize: 36, fontWeight: "bold" }}>🌱 Crop Prediction</h1>
        
      </div>

      <div style={{ maxWidth: 600, width: "100%" }}>
        {Object.keys(nutrientInfo).map((key) => (
          <div key={key} style={cardStyle}>
            <h2 style={{ fontSize: 22, fontWeight: "bold", color: "#1c3c1d", marginBottom: 8 }}>{key}</h2>
            <p style={{ color: "#386641", marginBottom: 12 }}>{nutrientInfo[key]}</p>
            <input type="number" name={key} value={form[key as keyof FormState]} onChange={handleChange} style={inputStyle} />
          </div>
        ))}

        {/* Soil Type */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 22, fontWeight: "bold", color: "#1c3c1d", marginBottom: 8 }}>Soil Type</h2>
          <p style={{ color: "#386641", marginBottom: 12 }}>Select your soil type. Different crops prefer different soils.</p>
          <select name="soil" onChange={handleChange} style={inputStyle}>
            <option value="">Select Soil</option>
            <option value="Clay">Clay</option>
            <option value="Loamy">Loamy</option>
            <option value="Peaty">Peaty</option>
            <option value="Saline">Saline</option>
            <option value="Sandy">Sandy</option>
            <option value="Silt">Silt</option>
          </select>
        </div>

        {/* Variety */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: 22, fontWeight: "bold", color: "#1c3c1d", marginBottom: 8 }}>Crop Variety</h2>
          <p style={{ color: "#386641", marginBottom: 12 }}>Select the crop variety you plan to grow or are interested in.</p>
          <select name="variety" onChange={handleChange} style={inputStyle}>
            <option value="">Select Variety</option>
            <option value="Arborio">Arborio</option>
            <option value="Basmati">Basmati</option>
            <option value="Beefsteak">Beefsteak</option>
            <option value="Cherry">Cherry</option>
            <option value="Co_0238">Co 0238</option>
            <option value="Co_86032">Co 86032</option>
            <option value="Co_99004">Co 99004</option>
            <option value="Dent">Dent</option>
            <option value="Durum">Durum</option>
            <option value="Flint">Flint</option>
            <option value="Hard_Red">Hard Red</option>
            <option value="Jasmine">Jasmine</option>
            <option value="Red">Red</option>
            <option value="Roma">Roma</option>
            <option value="Russet">Russet</option>
            <option value="Soft_Red">Soft Red</option>
            <option value="Sweet">Sweet</option>
            <option value="Yukon_Gold">Yukon Gold</option>
          </select>
        </div>

        <button onClick={handlePredict} style={{ ...buttonStyle, width: "100%", marginTop: 10 }}>Predict Crop</button>

        {result && (
          <>
            <div style={resultStyle}>🌾 Recommended Crop: <span style={{ fontWeight: "900" }}>{result}</span></div>
           
          </>
        )}
      </div>
    </div>
  );
};

export default PredictCrop;
