// src/components/teacher/TeacherDashboard.jsx
import React from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import C from '../../theme/colors';
import TeacherSidebar from './TeacherSidebar';
import { TeacherDesktopTopBar, TeacherMobileTopBar } from './TeacherTopBar';
import TeacherBottomNav from './TeacherBottomNav';
import TeacherOverview from './TeacherOverview';

export default function TeacherDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: C.bg, color: C.text, overflow: 'hidden' }}>
        <TeacherMobileTopBar/>
        <TeacherOverview isMobile/>
        <TeacherBottomNav active="home"/>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', background: C.bg, color: C.text, overflow: 'hidden' }}>
      <TeacherSidebar active="home"/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TeacherDesktopTopBar/>
        <TeacherOverview isMobile={false}/>
      </div>
    </div>
  );
}
