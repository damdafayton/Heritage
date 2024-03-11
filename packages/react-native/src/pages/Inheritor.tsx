import {View} from 'react-native';
import {Button, HelperText, Text, TextInput} from '../ui';
import {useContext, useState} from 'react';
import {Formik} from 'formik';
import {getEncryptedDataForInheritor} from '../utils/api';
import {AppStateContext} from '../context/AppState.context';
import {sleep} from '../utils/utils';
import {
  DataDecryptionForm,
  DataDecryptionFormVals,
} from '../forms/DataDecryptionForm';
import {decryptText, deriveKey} from '../helpers/crpyto';
import {logger} from '../utils/logger';
import {globalStyles} from '../ui/styles';
import {useTheme} from 'react-native-paper';
const log = logger('Inheritor');

export function Inheritor() {
  const [validateOnChange, setValidateOnChange] = useState(false);
  const [encryptedData, setEncryptedData] = useState<string | undefined>();
  const [decryptedData, setDecryptedData] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const {setError} = useContext(AppStateContext);

  const handleSubmit = async values => {
    setIsLoading(true);
    const {email, secretKey} = values;

    try {
      const res = await getEncryptedDataForInheritor(secretKey, email);

      if (res.status === 200) {
        setEncryptedData(res.data.encryptedData);
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setError({
        message:
          'Error retrieving data. Please use the correct key and the correct email where you have received the key.',
      });
      setIsLoading(false);
    }
  };

  const validate = values => {
    setValidateOnChange(true);

    return sleep(1000).then(() => {
      const errors: any = {};

      const {email, secretKey} = values;

      if (!secretKey) {
        errors.secretKey = 'Key is required';
      }

      if (!email) {
        errors.email = 'Email is required';
      }

      if (!email.match(/.+@.+\..+/)) {
        errors.email = 'Incorrect email';
      }

      return errors;
    });
  };

  const onSubmitDecrypt = async (vals: DataDecryptionFormVals) => {
    if (!vals.secretKey || !encryptedData) return;

    setIsLoading(true);
    log.debug('Decrypting data', {vals, encryptedData});
    try {
      const key = await deriveKey(vals.secretKey);

      const decryptedData = await decryptText(key, encryptedData);
      log.info({decryptedData});

      setDecryptedData(decryptedData);
      setIsLoading(false);
    } catch (e) {
      log.error(e);
      setIsLoading(false);
    }
  };

  const theme = useTheme();

  if (decryptedData)
    return (
      <View
        style={{
          ...globalStyles.textDataView,
          backgroundColor: theme.colors.primaryContainer,
        }}>
        <Text>{decryptedData}</Text>
      </View>
    );

  if (encryptedData)
    return (
      <DataDecryptionForm
        initialEncryptedText={encryptedData}
        onSubmitDecrypt={onSubmitDecrypt}
        loading={isLoading}
      />
    );

  return (
    <View>
      <Formik
        validateOnChange={validateOnChange}
        validateOnBlur={validateOnChange}
        initialValues={{secretKey: '', email: ''}}
        onSubmit={handleSubmit}
        validate={validate}>
        {({handleChange, handleBlur, handleSubmit, values, errors}) => {
          return (
            <>
              <Text>
                App is running on Inheritor mode. Please enter the secret key
                and the email where you have received the key. If you would like
                to switch to Inheritee mode, please go to 'Settings' menu.
              </Text>
              <TextInput
                placeholder="Inheritor key"
                value={values.secretKey}
                onChangeText={handleChange('secretKey')}
              />
              {errors.secretKey ? (
                <HelperText type="error">{errors.secretKey}</HelperText>
              ) : null}
              <TextInput
                placeholder="Inheritor email"
                value={values.email}
                onChangeText={handleChange('email')}
              />
              {errors.email ? (
                <HelperText type="error">{errors.email}</HelperText>
              ) : null}
              <Button mode="contained-tonal" onPress={handleSubmit as any}>
                Retrieve
              </Button>
            </>
          );
        }}
      </Formik>
    </View>
  );
}
