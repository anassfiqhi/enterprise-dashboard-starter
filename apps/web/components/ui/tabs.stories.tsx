import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta: Meta = {
  title: 'UI/Tabs',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-96">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-4">
        <p className="text-muted-foreground text-sm">
          Overview content — summary of key metrics and recent activity.
        </p>
      </TabsContent>
      <TabsContent value="analytics" className="p-4">
        <p className="text-muted-foreground text-sm">
          Analytics content — charts, graphs, and trend data.
        </p>
      </TabsContent>
      <TabsContent value="settings" className="p-4">
        <p className="text-muted-foreground text-sm">
          Settings content — configuration and preferences.
        </p>
      </TabsContent>
    </Tabs>
  ),
};
