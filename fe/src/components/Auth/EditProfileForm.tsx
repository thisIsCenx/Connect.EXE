import React, { useEffect, useState } from 'react';
import { Form, Input, Button, DatePicker, Select, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { editProfile, getProfile, checkEmailUnique, checkPhoneUnique } from '../../services/AuthService';
import { Regex } from '../../constants/Regex';
import './styles/EditProfileForm.scss';
import dayjs from 'dayjs';

const { Option } = Select;

interface EditProfileFormProps {
  onClose?: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onClose }) => {
  // translation hook removed
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      const profileData = response.data;
      form.setFieldsValue({
        ...profileData,
        dateOfBirth: profileData.dateOfBirth ? dayjs(profileData.dateOfBirth) : null,
      });
    } catch (err: any) {
      setMessageText(err?.response?.data?.message || 'Failed to load profile');
      setMessageType('error');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const checkUnique = async (field: string, value: string) => {
    try {
      if (field === 'email') {
        const res = await checkEmailUnique(value);
        return res.data.available;
      } else if (field === 'phone') {
        const res = await checkPhoneUnique(value);
        return res.data.available;
      }
      return null;
    } catch {
      return null;
    }
  };

  const validateForm = (values: any): boolean => {
    const errors: { [key: string]: string } = {};
    const nameRegex = /^[a-zA-ZÀ-ỹ\s']{2,50}$/;
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    const identityRegex = /^[0-9]{9,12}$/;

    if (!nameRegex.test(values.fullName)) {
      errors.fullName = 'Invalid name';
    } else if (values.fullName.length > 50) {
      errors.fullName = 'Name is too long';
    }
    if (!values.fullName) {
      errors.fullName = 'This field is required';
    }

    if (!Regex.EMAIL.test(values.email)) {
      errors.email = 'Invalid email';
    } else if (!values.email) {
      errors.email = 'This field is required';
    }

    if (!phoneRegex.test(values.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number';
    } else if (!values.phoneNumber) {
      errors.phoneNumber = 'This field is required';
    }

    if (!identityRegex.test(values.identityCard)) {
      errors.identityCard = 'Invalid identity card';
    } else if (!values.identityCard) {
      errors.identityCard = 'This field is required';
    }

    if (values.dateOfBirth) {
      const today = new Date();
      const birthDate = values.dateOfBirth.toDate();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (isNaN(birthDate.getTime()) || age < 16) {
        errors.dateOfBirth = 'Invalid date of birth (must be 16+)';
      }
    }

    if (!values.gender || !['male', 'female', 'other'].includes(values.gender.toLowerCase())) {
      errors.gender = 'Gender is required';
    }

    if (!values.address || values.address.length < 5) {
      errors.address = 'Address is too short';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    setMessageText('');
    setMessageType('');
    setFieldErrors({});

    if (!validateForm(values)) {
      setLoading(false);
      return;
    }

    const originalValues = form.getFieldsValue();
    let errors: { [key: string]: string } = {};

    if (values.email !== originalValues.email) {
      const isEmailUnique = await checkUnique('email', values.email);
      if (isEmailUnique === false) {
        errors.email = 'Email already exists';
      } else if (isEmailUnique === null) {
        errors.email = 'Email check failed';
      }
    }

    if (values.phoneNumber !== originalValues.phoneNumber) {
      const isPhoneUnique = await checkUnique('phone', values.phoneNumber);
      if (isPhoneUnique === false) {
        errors.phoneNumber = 'Phone number already exists';
      } else if (isPhoneUnique === null) {
        errors.phoneNumber = 'Phone check failed';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await editProfile({
        ...values,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format('YYYY-MM-DD')
          : null,
      });
      // Ánh xạ mã thông báo thành thông điệp dịch
  let translatedMessage = 'Profile updated successfully'; // default message
      if (response.message) {
        switch (response.message) {
          case 'I0001':
            translatedMessage = 'Profile updated successfully'; // or specific message
            break;
          // Thêm các trường hợp khác nếu cần
          default:
            translatedMessage = response.message.includes('.') ? response.message : response.message;
        }
      }
      setMessageText(translatedMessage);
      setMessageType('success');
      setFieldErrors({});
    } catch (err: any) {
      let errors: { [key: string]: string } = {};
      const rawMsg = err?.response?.data?.message || err.message || '';
      if (rawMsg.includes('Email already exists')) {
  errors.email = 'Email already exists';
      } else if (rawMsg.includes('Phone number already exists')) {
  errors.phoneNumber = 'Phone number already exists';
      } else if (rawMsg.includes('Identity card already exists')) {
  errors.identityCard = 'Identity card already exists';
      } else if (rawMsg === 'I0001') {
        setMessageText('Failed to update profile'); // I0001 => failed
        setMessageType('error');
      } else if (rawMsg.includes('Invalid data')) {
        setMessageText('Invalid data');
        setMessageType('error');
      } else {
        setMessageText(rawMsg || 'Failed to update profile');
        setMessageType('error');
      }
      setFieldErrors(errors);
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="edit-profile-form-wrapper">
        <div className="edit-profile-card">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="edit-profile-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <UserOutlined style={{ fontSize: 32, color: '#d32f2f', marginRight: 12 }} />
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#d32f2f', textAlign: 'center', letterSpacing: 1 }}>
          Edit profile
        </h2>
      </div>
      
      <Form layout="vertical" form={form} onFinish={onFinish} validateTrigger={['onBlur', 'onChange']} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item 
            label={'Full name'} 
            name="fullName" 
            validateStatus={fieldErrors.fullName ? 'error' : ''}
            help={fieldErrors.fullName}
            rules={[
              { required: true, message: 'This field is required' },
              {
                validator: (_, value) => {
                  if (!value || /^[a-zA-ZÀ-ỹ\s']{2,50}$/.test(value)) return Promise.resolve();
                  return Promise.reject(new Error('Invalid name'));
                }
              },
              { max: 50, message: 'Name is too long' }
            ]}
            validateTrigger={['onBlur', 'onChange']}
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label={'Email'} 
            name="email" 
            validateStatus={fieldErrors.email ? 'error' : ''}
            help={fieldErrors.email}
            rules={[
              { required: true, message: 'This field is required' },
              { type: 'email', message: 'Invalid email' }
            ]}
            validateTrigger={['onBlur', 'onChange']}
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item 
            label={'auth.editProfile.phoneNumber'} 
            name="phoneNumber" 
            validateStatus={fieldErrors.phoneNumber ? 'error' : ''}
            help={fieldErrors.phoneNumber}
            rules={[
              { required: true, message: 'auth.validation.required' },
              {
                validator: (_, value) => {
                  if (!value || /^(0|\+84)[0-9]{9}$/.test(value)) return Promise.resolve();
                  return Promise.reject(new Error('auth.validation.invalidPhone'));
                }
              }
            ]}
            validateTrigger={['onBlur', 'onChange']}
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            label={'auth.editProfile.address'} 
            name="address" 
            validateStatus={fieldErrors.address ? 'error' : ''}
            help={fieldErrors.address}
            rules={[
              { required: true, message: 'auth.validation.required' },
              { min: 5, message: 'auth.validation.addressTooShort' }
            ]}
            validateTrigger={['onBlur', 'onChange']}
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item 
            label={'auth.editProfile.gender'} 
            name="gender" 
            validateStatus={fieldErrors.gender ? 'error' : ''}
            help={fieldErrors.gender}
            rules={[
              { required: true, message: 'auth.validation.genderRequired' },
              {
                validator: (_, value) => {
                  if (!value || ['male', 'female', 'other'].includes(value.toLowerCase())) return Promise.resolve();
                  return Promise.reject(new Error('auth.validation.genderRequired'));
                }
              }
            ]}
            validateTrigger={['onBlur', 'onChange']}
            style={{ flex: 1 }}
          >
            <Select placeholder={'auth.editProfile.selectGender'}>
              <Option value="male">{'auth.editProfile.male'}</Option>
              <Option value="female">{'auth.editProfile.female'}</Option>
              <Option value="other">{'auth.editProfile.other'}</Option>
            </Select>
          </Form.Item>
          <Form.Item 
            label={'auth.editProfile.identityCard'} 
            name="identityCard" 
            validateStatus={fieldErrors.identityCard ? 'error' : ''}
            help={fieldErrors.identityCard}
            rules={[
              { required: true, message: 'auth.validation.required' },
              {
                validator: (_, value) => {
                  if (!value || /^[0-9]{9,12}$/.test(value)) return Promise.resolve();
                  return Promise.reject(new Error('auth.validation.invalidIdentityCard'));
                }
              }
            ]}
            validateTrigger={['onBlur', 'onChange']}
            style={{ flex: 1 }}
          >
            <Input />
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item 
            label={'auth.editProfile.dateOfBirth'}
            name="dateOfBirth" 
            validateStatus={fieldErrors.dateOfBirth ? 'error' : ''}
            help={fieldErrors.dateOfBirth}
            rules={[
              { required: true, message: 'auth.validation.required' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const today = new Date();
                  const birthDate = value.toDate();
                  const age = today.getFullYear() - birthDate.getFullYear();
                  if (isNaN(birthDate.getTime()) || age < 16) {
                    return Promise.reject(new Error('auth.validation.invalidAge'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
            validateTrigger={['onBlur', 'onChange']}
            style={{ flex: 1 }}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <div style={{ flex: 1 }}></div>
        </div>
        {/* Di chuyển Alert vào đây, cùng hàng với Date of Birth */}
        {messageText && (
          <div style={{ width: '50%', margin: '0 0 12px 12px', minHeight: 48 }}>
            <Alert
              className="edit-profile-message"
              message={messageText}
              type={messageType === 'success' ? 'success' : 'error'}
              showIcon={false}
            />
          </div>
        )}
        {!messageText && (
          <div style={{ width: '50%', margin: '0 0 12px 12px', minHeight: 48 }}></div>
        )}
        
        <Form.Item style={{ marginTop: 20, marginBottom: 24 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {loading ? 'common.loading' : 'auth.editProfile.saveChanges'}
          </Button>
        </Form.Item>

        {onClose && (
          <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
            <Button type="default" onClick={onClose} block>
              {'common.cancel'}
            </Button>
          </Form.Item>
        )}
      </Form>
    </>
  );
};

export default EditProfileForm;