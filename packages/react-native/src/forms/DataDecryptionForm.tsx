import {Formik} from 'formik';
import {FormEvent, useState} from 'react';
import {View} from 'react-native';

import {Button, TextInput, HelperText} from '../ui';
import {sleep} from '../utils/utils';

import {DataCard} from '../molecules/DataCard';

export type DataDecryptionFormVals = {
  secretKey: string;
};

type DataDecryptionFormType = {
  initialEncryptedText: string;
  onSubmitDecrypt: (values: Omit<DataDecryptionFormVals, 'emails'>) => void;
};

export function DataDecryptionForm({
  initialEncryptedText,
  onSubmitDecrypt,
}: DataDecryptionFormType) {
  const [validateOnChange, setValidateOnChange] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = values => {
    setValidateOnChange(true);

    return sleep(100).then(() => {
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
        setLoading(true);
        await onSubmitDecrypt(values);

        resetForm();
        setLoading(false);
      }}>
      {({handleChange, handleBlur, handleSubmit, values, errors}) => (
        <View>
          <DataCard text={initialEncryptedText} />
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
