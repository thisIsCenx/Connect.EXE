import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
// translations removed; using plain strings
import { changePassword } from '../../services/AuthService';
import { Regex } from '../../constants/Regex';


interface ChangePasswordFormProps {
  onClose?: () => void;
}

const ChangePassword: React.FC<ChangePasswordFormProps> = ({ onClose }) => {
  // translation hook removed
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [oldPasswordError, setOldPasswordError] = useState<string | null>(null);
  const [generalMessage, setGeneralMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  // Thêm hàm validate mật khẩu mới
  const validateNewPassword = (password: string) => {
    if (!password || password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!Regex.PASSWORD.test(password)) {
      return 'Password does not meet complexity requirements';
    }
    return null;
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    setOldPasswordError(null);
    setGeneralMessage(null);

    // Validation
    if (!values.oldPassword) {
      setGeneralMessage({
        type: 'error',
        content: 'Current password is required',
      });
      setLoading(false);
      return;
    }

    // Sử dụng validateNewPassword thay cho Regex.PASSWORD
    const passwordError = validateNewPassword(values.newPassword);
    if (passwordError) {
      setGeneralMessage({
        type: 'error',
        content: passwordError,
      });
      setLoading(false);
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      setGeneralMessage({
        type: 'error',
        content: 'New passwords do not match',
      });
      setLoading(false);
      return;
    }

    if (values.oldPassword === values.newPassword) {
      setGeneralMessage({
        type: 'error',
        content: 'New password must be different from the old password',
      });
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      
      setGeneralMessage({ 
        type: 'success', 
        content: 'Password updated successfully' 
      });
      form.resetFields();
      
      // Auto close after 2 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || err.message || '';

      
      if (rawMsg.includes('Current password is incorrect')) {
  setOldPasswordError('Current password is incorrect');
      } else if (rawMsg.includes('Cannot change password for Google login accounts')) {
        setGeneralMessage({
          type: 'error',
          content: 'Cannot change password for Google login accounts',
        });
      } else if (rawMsg.includes('Invalid password format')) {
        setGeneralMessage({
          type: 'error',
          content: 'Password must be at least 8 characters',
        });
      } else {
        setGeneralMessage({ 
          type: 'error', 
          content: 'Failed to change password' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Form.Item
    label={'Current password'}
        name="oldPassword"
        validateStatus={oldPasswordError ? 'error' : ''}
        help={oldPasswordError || ''}
        rules={[{ required: true, message: 'Current password is required' }]}
      >
        <Input.Password placeholder={'Current password'} />
      </Form.Item>

      <Form.Item
        label={'New password'}
        name="newPassword"
        rules={[{ required: true, message: 'New password is required' }]}
      >
        <Input.Password placeholder={'New password'} />
      </Form.Item>

      <Form.Item
        label={'Confirm password'}
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Please confirm the new password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('New passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password placeholder={'Confirm password'} />
      </Form.Item>

      <Form.Item style={{ minHeight: 44, marginBottom: 12, marginTop: 0, transition: 'min-height 0.2s' }}>
        {generalMessage && (
          <Alert
            className="change-password-message"
            message={generalMessage.content}
            type={generalMessage.type}
            showIcon={false}
          />
        )}
      </Form.Item>

      <Form.Item style={{ marginTop: 'auto', marginBottom: 0 }}>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {loading ? 'Loading...' : 'Update password'}
        </Button>
      </Form.Item>

      {onClose && (
        <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
          <Button type="default" onClick={onClose} block>
              {'Cancel'}
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default ChangePassword;
