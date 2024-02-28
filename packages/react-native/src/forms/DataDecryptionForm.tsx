import {Formik} from 'formik';
import {FormEvent, useState} from 'react';
import {ScrollView, View} from 'react-native';

import {Button, TextInput, Text, HelperText} from '../ui';
import {sleep} from '../utils/utils';
import {globalStyles} from '../styles';
import {useTheme} from 'react-native-paper';

export type DataDecryptionFormVals = {
  secretKey: string;
};

type DataDecryptionFormType = {
  initialEncryptedText: string;
  onSubmitDecrypt: (values: Omit<DataDecryptionFormVals, 'emails'>) => void;
  loading: boolean;
};

export function DataDecryptionForm({
  initialEncryptedText,
  loading,
  onSubmitDecrypt,
}: DataDecryptionFormType) {
  const [validateOnChange, setValidateOnChange] = useState(false);
  const colors = useTheme().colors;

  const validate = values => {
    setValidateOnChange(true);

    return sleep(1000).then(() => {
      const errors: any = {};

      const {secretKey} = values;

      if (!secretKey) {
        errors.secretKey = 'Key is required';
      }

      return errors;
    });
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        secretKey: '',
      }}
      validateOnChange={validateOnChange}
      validateOnBlur={validateOnChange}
      validateOnMount={false}
      validate={validate}
      onSubmit={async (values, {resetForm}) => {
        await onSubmitDecrypt(values);

        resetForm();
      }}>
      {({handleChange, handleBlur, handleSubmit, values, errors}) => (
        <View>
          <Text
            style={{
              ...globalStyles.encryptedDataBox,
              backgroundColor: colors.primaryContainer,
            }}>
            {initialEncryptedText}
          </Text>
          <TextInput
            placeholder="Type your secret key"
            value={values.secretKey}
            onChangeText={handleChange('secretKey')}
            onBlur={handleBlur('secretKey')}
          />
          {errors.secretKey && (
            <HelperText type="error">{errors.secretKey}</HelperText>
          )}
          <Button
            loading={loading}
            mode={'contained'}
            onPress={e =>
              handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
            }>
            Decrypt
          </Button>
        </View>
      )}
    </Formik>
  );
}
