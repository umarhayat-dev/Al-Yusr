import { useState } from "react";
import { rtdb, auth } from "@/lib/firebase";
import { ref, push, set } from "firebase/database";
import { signInAnonymously } from "firebase/auth";
import { Button } from "@/components/ui/button";

export default function FirebaseTest() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    setStatus("Testing server Firebase connection...");
    
    try {
      // Test server-side Firebase submission
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formType: 'contactMessages',
          data: {
            name: "Test User",
            email: "test@example.com",
            subject: "Test Subject",
            message: "Test message from Firebase test component"
          }
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setStatus(`✅ Server Firebase test successful! Entry ID: ${result.id}`);
      } else {
        setStatus(`❌ Server test failed: ${result.message}`);
      }
      
    } catch (error: any) {
      console.error("Server Firebase test failed:", error);
      setStatus(`❌ Server test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Firebase Connection Test</h3>
      <Button 
        onClick={testFirebaseConnection} 
        disabled={loading}
        className="mb-2"
      >
        {loading ? "Testing..." : "Test Firebase"}
      </Button>
      {status && (
        <div className="p-2 bg-white border rounded text-sm">
          {status}
        </div>
      )}
    </div>
  );
}