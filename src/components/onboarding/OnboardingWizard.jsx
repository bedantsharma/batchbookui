// src/components/onboarding/OnboardingWizard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Button, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { randomHandle, randomInstitute } from './wizardUtils';
import RoleStep from './RoleStep';
import ProfileStep from './ProfileStep';
import ParentDetailsStep from './ParentDetailsStep';
import InstitutionStep from './InstitutionStep';
import PhoneOtpStep from './PhoneOtpStep';

const STEPS = {
  student: ['role', 'profile', 'parentDetails', 'parentOtp'],
  teacher: ['role', 'profile', 'institution', 'teacherOtp'],
};

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    role: '',
    name: randomHandle(),
    email: '',
    parentName: '',
    parentPhone: '',
    institutionName: randomInstitute(),
    teacherPhone: '',
  });
  const [errors, setErrors] = useState({});

  const steps = STEPS[data.role] ?? ['role', 'profile', 'parentDetails', 'parentOtp'];
  const currentStepId = steps[step];
  const totalSteps = steps.length;

  const SKIPPABLE = ['profile', 'institution'];
  const canSkip = SKIPPABLE.includes(currentStepId);

  const update = (fields) => setData(d => ({ ...d, ...fields }));

  const validateStep = () => {
    const e = {};
    if (currentStepId === 'role' && !data.role) { e.role = 'Please select a role.'; }
    if (currentStepId === 'parentDetails') {
      if (!data.parentName.trim()) e.parentName = 'Parent name is required.';
      if (data.parentPhone.length !== 10) e.parentPhone = 'Enter a valid 10-digit phone number.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (data.role === 'owner') {
      navigate('/phone-login');
      return;
    }
    if (validateStep()) setStep(s => s + 1);
  };
  const back = () => { setErrors({}); setStep(s => s - 1); };
  const skip = () => setStep(s => s + 1);

  const handleOtpSuccess = (phone) => {
    const profile = { ...data };
    localStorage.setItem('onboarding_profile', JSON.stringify(profile));
    navigate('/dashboard/student');
  };

  const renderStep = () => {
    switch (currentStepId) {
      case 'role':
        return <RoleStep value={data.role} onChange={role => { update({ role }); setErrors({}); }}/>;
      case 'profile':
        return <ProfileStep name={data.name} email={data.email} onChangeName={n => update({ name: n })} onChangeEmail={e => update({ email: e })}/>;
      case 'parentDetails':
        return <ParentDetailsStep parentName={data.parentName} parentPhone={data.parentPhone} onChangeName={n => update({ parentName: n })} onChangePhone={p => update({ parentPhone: p })} errors={errors}/>;
      case 'institution':
        return <InstitutionStep institutionName={data.institutionName} onChange={n => update({ institutionName: n })}/>;
      case 'parentOtp':
        return <PhoneOtpStep phone={data.parentPhone} name={data.parentName} label="Parent's phone" onSuccess={handleOtpSuccess}/>;
      case 'teacherOtp':
        return <PhoneOtpStep label="Your phone number" onSuccess={handleOtpSuccess}/>;
      default:
        return null;
    }
  };

  const isOtpStep = currentStepId === 'parentOtp' || currentStepId === 'teacherOtp';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 460, p: 4, borderRadius: 4, boxShadow: 3, bgcolor: 'background.paper' }}>

        {/* Header: back + progress dots */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {step > 0 && (
            <IconButton onClick={back} size="small" sx={{ mr: 1, color: 'text.secondary' }}>
              <ArrowBackIcon fontSize="small"/>
            </IconButton>
          )}
          <Box sx={{ flex: 1, display: 'flex', gap: 0.75 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <Box key={i} sx={{ height: 4, flex: 1, borderRadius: 2, bgcolor: i <= step ? 'primary.main' : 'rgba(255,255,255,0.12)', transition: 'background-color 0.2s' }}/>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5, whiteSpace: 'nowrap' }}>
            {step + 1} / {totalSteps}
          </Typography>
        </Box>

        {/* Step content */}
        {renderStep()}

        {/* Footer actions — hidden on OTP steps (they handle their own submit) */}
        {!isOtpStep && (
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {errors.role && <Typography variant="caption" color="error">{errors.role}</Typography>}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={currentStepId === 'role' && !data.role}
              onClick={next}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              {currentStepId === 'parentDetails' ? 'Send OTP to Parent' : 'Continue'}
            </Button>
            {canSkip && (
              <Button variant="text" fullWidth onClick={skip} sx={{ color: 'text.secondary', fontSize: 13 }}>
                Skip for now
              </Button>
            )}
          </Box>
        )}
      </Card>
    </Box>
  );
}
