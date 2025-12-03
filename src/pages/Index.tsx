/**
 * Index Page
 * Entry point for Netral Apps - currently loads Netral Block
 */

import { BlockApp } from '@/apps/block/BlockApp';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Netral Block - Éditeur Markdown Moderne</title>
        <meta name="description" content="Netral Block est un éditeur Markdown moderne avec des extensions personnalisées pour créer des documents riches et interactifs." />
      </Helmet>
      <BlockApp />
    </>
  );
};

export default Index;
