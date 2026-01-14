import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

type Password = {
  id: string;
  service: string;
  password: string;
  createdAt: string;
};

type GenerateResponse = {
  password: string;
};

const PasswordManager = () => {
  const queryClient = useQueryClient();
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [serviceName, setServiceName] = useState<string>("");

  // 1. Fetch Passwords (useQuery)
  const { data: passwords, isLoading, isError } = useQuery({
    queryKey: ["passwords"],
    queryFn: async () => {
      const { data } = await axios.get<Password[]>("http://localhost:8080/api/passwords");
      return data;
    },
  });

  // 2. Generate Password Mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<GenerateResponse>("http://localhost:8080/api/generate", {
        length: 12,
        includeSymbols: true,
        includeNumbers: true,
      });
      return data;
    },
    onSuccess: (data) => {
      setGeneratedPassword(data.password);
    },
  });

  // 3. Save Password Mutation
  const saveMutation = useMutation({
    mutationFn: async (newPassword: { service: string; password: string }) => {
      await axios.post("http://localhost:8080/api/passwords", newPassword);
    },
    onSuccess: () => {
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["passwords"] });
      setServiceName("");
      setGeneratedPassword("");
      alert("Password saved!");
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleSave = () => {
    if (!serviceName || !generatedPassword) return;
    saveMutation.mutate({ service: serviceName, password: generatedPassword });
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Password Manager</h1>

      <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2>Generate</h2>
        <button onClick={handleGenerate} disabled={generateMutation.isPending}>
          {generateMutation.isPending ? "Generating..." : "Generate New Password"}
        </button>
        
        {generatedPassword && (
          <div style={{ marginTop: "1rem" }}>
            <p><strong>Generated:</strong> {generatedPassword}</p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <input
                type="text"
                placeholder="Service Name (e.g. Gmail)"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                style={{ padding: "0.5rem" }}
              />
              <button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Password"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h2>Saved Passwords</h2>
        {isLoading && <p>Loading...</p>}
        {isError && <p style={{ color: "red" }}>Error fetching passwords</p>}
        
        {passwords && passwords.length === 0 && <p>No passwords saved yet.</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {passwords?.map((p) => (
            <li key={p.id} style={{ marginBottom: "0.5rem", padding: "0.5rem", background: "#f9f9f9", borderRadius: "4px" }}>
              <strong>{p.service}:</strong> {p.password}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PasswordManager;
