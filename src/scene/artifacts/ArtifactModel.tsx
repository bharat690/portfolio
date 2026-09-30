import type { ReactNode } from 'react';
import { Badge } from './Badge';
import { Knife } from './Knife';
import { Magazine } from './Magazine';
import { Medal } from './Medal';
import { Radio } from './Radio';
import type { ArtifactId } from '../../data/portfolio';

const models: Record<ArtifactId, () => ReactNode> = {
  medal: Medal,
  badge: Badge,
  magazine: Magazine,
  knife: Knife,
  radio: Radio,
};

export function ArtifactModel({ id }: { id: ArtifactId }) {
  const Model = models[id];
  return <Model />;
}
