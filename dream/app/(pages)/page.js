// pages/index.js
import Head from 'next/head';
import MapComponent from '@/app/_lib/mapbox/map.js';


const Home = () => {
  return (
    <div>
      <Head>
        <meta name="description" content="A simple Mapbox example with Next.js" />
      </Head>
      <MapComponent />
    </div>
  );
};

export default Home;
