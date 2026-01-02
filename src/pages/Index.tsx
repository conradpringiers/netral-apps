/**
 * Index Page
 * Entry point for Netral Apps - shows launcher and mode switching
 */

import { NetralApp } from '@/apps/NetralApp';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Netral - Créez des sites et présentations</title>
        <meta name="description" content="Netral est une suite d'outils pour créer des sites web et des présentations avec une syntaxe simple et intuitive." />
      </Helmet>
      <NetralApp />
    </>
  );
};

export default Index;
