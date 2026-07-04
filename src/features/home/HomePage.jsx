import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import HeroMarketing from './HeroMarketing';
import Gallery from './Gallery';
import Description from './Description';

const HomePage = () => (
  <>
    <Header />
    <HeroMarketing />
    <Gallery />
    <Description />
    <Footer />
  </>
);

export default HomePage;