import axios from 'axios';
import ReactOnRails from 'react-on-rails';

let headers = ReactOnRails.authenticityHeaders();
headers["Content-Type"] = "application/json";

export default axios.create({ headers });
