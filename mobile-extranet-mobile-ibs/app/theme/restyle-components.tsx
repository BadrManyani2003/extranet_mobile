// app/restyle-components.tsx
import { createBox, createText } from '@shopify/restyle';
import { Theme } from './theme';

export const Box = createBox<Theme>();
export const Text = createText<Theme>();

// Types pour les props
export type TextProps = React.ComponentProps<typeof Text>;
export type BoxProps = React.ComponentProps<typeof Box>;
