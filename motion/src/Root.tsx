import React from 'react';
import { Composition } from 'remotion';
import { CreateEvent, R2 } from './region2/CreateEvent';
import { CommunityCalendar, R1 } from './region1/CommunityCalendar';
import { ContactSheet } from './ContactSheet';

export const Root: React.FC = () => (
  <>
    <Composition id="region1-community-calendar" component={CommunityCalendar} {...R1} />
    <Composition id="region2-create-event" component={CreateEvent} {...R2} />
    {/* dev-only contact sheets */}
    <Composition
      id="dev-r2-contact" width={1940} height={1252} fps={30} durationInFrames={R2.durationInFrames}
      component={() => <ContactSheet Comp={CreateEvent} frames={[20, 84, 166, 226, 290, 330, 350, 400, 446, 466, 518, 640, 712, 870]} crop={{ x: 0, y: 0, w: 1536, h: 1008 }} cols={4} scale={0.31} />}
    />
    <Composition
      id="dev-r1-contact" width={1530} height={1040} fps={30} durationInFrames={R1.durationInFrames}
      component={() => <ContactSheet Comp={CommunityCalendar} frames={[30, 75, 110, 140, 170, 200, 230, 260, 290, 320, 340, 359]} crop={{ x: 0, y: 0, w: 1536, h: 1008 }} cols={3} scale={0.33} />}
    />
  </>
);
