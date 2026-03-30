# Developer Guide

## Setup

```bash
npm install
npm run dev
```

## Using the SDK

### Basic Scene

```jsx
import { DigitalSpace, ControlStyle } from 'digital-space-toolkit';

<DigitalSpace
  defaultControlStyle={ControlStyle.ORBIT}
  debug={true}
>
  {/* Your 3D content */}
</DigitalSpace>
```

### Registering Custom Tags

```jsx
import tagRegistry from 'digital-space-toolkit/TagRegistry';

function MyTag({ name }) {
  return <div>{name}</div>;
}

tagRegistry.register('PREFIX', MyTag, { distanceFactor: 40 });
```

### Backend Integration

```jsx
import dataRegistry from 'digital-space-toolkit/DataRegistry';
import webRegistry from 'digital-space-toolkit/WebRegistry';

// Scene data gateway
dataRegistry.register({
  getScene: async (name) => { /* fetch scene */ },
  upsert: async (name, config) => { /* save scene */ },
  download: async (name) => { /* download zip */ }
});

// File URL gateway
webRegistry.register({
  getFileUrl: (path) => `/assets/${path}`
});
```

### Event System

```jsx
import { eventChannelHub, CONTROL_CHANNELS } from 'digital-space-toolkit/EventChannelHub';

// Publish
eventChannelHub.publish(CONTROL_CHANNELS.OBJECT_UPDATE, {
  uuid: 'object-uuid',
  property: 'position',
  value: { x: 0, y: 10, z: 0 }
});

// Subscribe
eventChannelHub.subscribe(CONTROL_CHANNELS.OBJECT_UPDATE, (data) => {
  console.log(data);
});
```
