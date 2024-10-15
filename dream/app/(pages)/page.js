// pages/index.js
import Head from 'next/head';
import MapComponent from '@/app/_lib/mapbox/map.js';

const Home = () => {
  return (
    <div className="w-full h-screen overflow-hidden">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="description" content="A simple Mapbox example with Next.js" />
      </Head>
      <MapComponent />
    </div>
  );
};

export default Home;