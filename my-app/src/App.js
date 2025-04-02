import logo from './logo.svg';
import './App.css';

function Profile(){
  return (
    <img 
    src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRBkH2cNXDcRMm2TdWUAT7NuDPc8b9Tov8KdH6d2KK4JWCj4628TDV3hV-RDScJB_6Birtbr-JuTRFz7iX8StSLeg"
    alt="kendrick lamar"
    />
  );
}

export default function Gallery() {
  return (
    <section>
      <h1>GOAT RAPPER</h1>
      <Profile />
      <Profile />
      <Profile />
    </section>
  )
}
