// pages/index.js
import Head from 'next/head';
import MapComponent from '@/app/_lib/mapbox/map.js';


const Home = () => {
  return (
    <div>
      <Head>
        <title>My Mapbox Example</title>
        <meta name="description" content="A simple Mapbox example with Next.js" />
      </Head>
      <h1>Mapbox with Next.js</h1>
      <MapComponent />
    </div>
  );
};

export default Home;
