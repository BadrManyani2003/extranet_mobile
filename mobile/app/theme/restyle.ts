// app/restyle.ts
import { createBox, createText } from '@shopify/restyle';
import { Theme } from './theme';

// Créer et exporter les composants Restyle
export const Box = createBox<Theme>();
export const Text = createText<Theme>();

// Types utiles
export type TextProps = React.ComponentProps<typeof Text>;
export type BoxProps = React.ComponentProps<typeof Box>;
