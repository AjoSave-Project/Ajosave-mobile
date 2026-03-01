/**
 * Component Exports
 * 
 * Central export file for all UI components in the AjoSave mobile application.
 * Provides a single import point for all reusable components.
 * 
 * @module components
 * 
 * @example
 * ```tsx
 * // Import multiple components
 * import { Button, Card, Input, Container } from '@/components';
 * 
 * // Use in a component
 * function MyScreen() {
 *   return (
 *     <Container>
 *       <Card>
 *         <Input label="Email" type="email" />
 *         <Button variant="primary">Submit</Button>
 *       </Card>
 *     </Container>
 *   );
 * }
 * ```
 */

// Button components
export { Button } from './ui/Button';
export type { ButtonProps } from './ui/Button';

// Card components
export { Card } from './ui/Card';
export type { CardProps } from './ui/Card';

// Input components
export { Input } from './ui/Input';
export type { InputProps } from './ui/Input';

// Pill components
export { Pill, PillGroup } from './ui/Pill';
export type { PillProps, PillGroupProps } from './ui/Pill';

// Progress components
export { ProgressIndicator } from './ui/ProgressIndicator';
export type { ProgressIndicatorProps } from './ui/ProgressIndicator';

// Avatar components
export { Avatar } from './ui/Avatar';
export type { AvatarProps } from './ui/Avatar';

// Badge components
export { Badge } from './ui/Badge';
export type { BadgeProps } from './ui/Badge';

// Typography components
export { Heading, Text } from './ui/Typography';
export type { HeadingProps, TextProps } from './ui/Typography';

// Layout components
export { Container, ScreenWrapper, SectionHeader } from './ui/Layout';
export type { ContainerProps, ScreenWrapperProps, SectionHeaderProps } from './ui/Layout';

// Error Boundary
export { ErrorBoundary } from './ErrorBoundary';
