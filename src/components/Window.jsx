import React, { useState } from "react";

const WINDOW_SIZE = 10;

function Window() {
  const [numberType, setNumberType] = useState("e");
  const [windowPrevState, setWindowPrevState] = useState([]);
  const [windowCurrState, setWindowCurrState] = useState([]);
  const [numbers, setNumbers] = useState([]);
  const [avg, setAvg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNumbers = async () => {
    setLoading(true);
    setError("");
    setNumbers([]);
    setAvg(null);

    const url = `http://localhost:9876/numbers/${numberType}`;
    let controller = new AbortController();
    let timeout = setTimeout(() => controller.abort(), 1000);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setWindowPrevState(data.windowPrevState || []);
      setWindowCurrState(data.windowCurrState || []);
      setNumbers(data.numbers || []);
      setAvg(data.avg !== undefined ? data.avg : null);
    } catch (err) {
      setError("Failed to fetch or took too long");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <label>
          Number Type:&nbsp;
          <select value={numberType} onChange={e => setNumberType(e.target.value)}>
            <option value="p">Prime</option>
            <option value="f">Fibonacci</option>
            <option value="e">Even</option>
            <option value="r">Random</option>
          </select>
        </label>
        <button onClick={fetchNumbers} disabled={loading}>
          {loading ? "Loading..." : "Fetch Numbers"}
        </button>
      </div>
      {error && <div style={{color:"red"}}>{error}</div>}
      <div>
        <h4>windowPrevState:</h4>
        <pre>{JSON.stringify(windowPrevState)}</pre>
        <h4>windowCurrState:</h4>
        <pre>{JSON.stringify(windowCurrState)}</pre>
        <h4>numbers (from API):</h4>
        <pre>{JSON.stringify(numbers)}</pre>
        <h4>avg:</h4>
        <pre>{avg !== null ? avg : "-"}</pre>
      </div>
    </div>
  );
}

export default Window;
