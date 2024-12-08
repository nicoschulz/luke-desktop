import { useState } from 'react';
import { MCPTest } from './components/MCPTest';
import './index.css';

function App() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold my-4">Luke Desktop</h1>
      <MCPTest />
    </div>
  );
}

export default App;