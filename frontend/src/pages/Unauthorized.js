import "../css/errors.css";

export default function Unauthorized() {
  return (
    <div className="error-page">
      <div>
        <h1>401</h1>
        <p>Accès non autorisé</p>
      </div>
    </div>
  );
}
