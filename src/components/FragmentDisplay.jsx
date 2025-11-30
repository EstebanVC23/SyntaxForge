import React from "react";
export default function FragmentDisplay({ fragment }) {
return (
<div style={{ marginBottom: 8 }}>
<strong>Estructura objetivo:</strong> <span className="token">{fragment}</span>
</div>
);
}