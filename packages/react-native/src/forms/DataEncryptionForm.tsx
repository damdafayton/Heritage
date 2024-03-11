import {Formik} from 'formik';
import {FormEvent, useContext, useEffect, useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

import {Button, TextInput, Text, HelperText} from '../ui';
import {sleep} from '../utils/utils';
import {AppStateContext} from '../context/AppState.context';
import {useTheme} from 'react-native-paper';
import {globalStyles} from '../ui/styles';
import {styles} from './styles';
import {logger} from '../utils/logger';
const log = logger('DataEncryptionForm');

export type EncryptedDataFormVals = {
  secretKey: string;
  clientEncryptedText?: string;
  emails: string[];
};

type DataEncryptionFormType = {
  onSubmit: (values: EncryptedDataFormVals) => void;
  deriveKeyAndEncryptText: (text: string, secretKey) => Promise<string>;
  initialText?: string;
  initialEmails: string[];
  loading: boolean;
};

export function DataEncryptionForm({
  initialText,
  initialEmails,
  loading,
  onSubmit,
  deriveKeyAndEncryptText,
}: DataEncryptionFormType) {
  const [clientEncryptedText, setClientEncryptedText] = useState('');
  const [validateOnChange, setValidateOnChange] = useState(false);
  const [emails, setEmails] = useState<string[]>(['']);

  useEffect(() => {
    if (initialEmails.length) setEmails(initialEmails);
  }, []);

  const {setError} = useContext(AppStateContext);

  const {colors} = useTheme();

  const validate = values => {
    setValidateOnChange(true);

    return sleep(1000).then(() => {
      const errors: any = {};

      const {text, secretKey} = values;

      if (!text) {
        errors.text = 'Data is required';
      }

      if (!secretKey) {
        errors.secretKey = 'Key is required';
      }

      if (!emails[0]) {
        errors.email0 = 'Email is required';
      }

      emails.forEach((email, idx) => {
        if (!email.match(/.+@.+\..+/)) {
          errors[`email${idx}`] = 'Incorrect email';
        }
      });

      return errors;
    });
  };

  const onPressAddAnotherEmail = () => {
    if (emails.every(x => x)) {
      setEmails([...emails, '']);
    } else {
      setError({message: 'Field is empty'});
    }
  };

  const deleteEmail = (idx: number) => {
    setEmails([...emails.slice(0, idx), ...emails.slice(idx + 1)]);
  };

  const setEmail = (idx: number, email: string) => {
    setEmails([...emails.slice(0, idx), email, ...emails.slice(idx + 1)]);
  };

  const handleOnSubmit = async (values, {resetForm}) => {
    values.emails = emails;
    values.clientEncryptedText = clientEncryptedText;

    await onSubmit(values);
  };

  const theme = useTheme();

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        secretKey: '',
        text: initialText,
        emails: initialEmails,
        clientEncryptedText: '',
      }}
      validateOnChange={validateOnChange}
      validateOnBlur={validateOnChange}
      validateOnMount={false}
      validate={validate}
      onSubmit={handleOnSubmit}>
      {({handleChange, handleBlur, handleSubmit, values, errors}) => (
        <View>
          <TextInput
            style={styles.data}
            label={'Data'}
            multiline={true}
            placeholder={'Type your data'}
            value={values.text}
            onChangeText={async text => {
              handleChange('text')(text);

              if (text) {
                try {
                  const encryptedText = await deriveKeyAndEncryptText(
                    text,
                    values.secretKey,
                  );

                  setClientEncryptedText(encryptedText);
                } catch (e) {
                  log.error(e);
                }
              } else {
                setClientEncryptedText('');
              }
            }}
            onBlur={handleBlur('text')}
          />
          {errors.text && <HelperText type="error">{errors.text}</HelperText>}

          <TextInput
            label={'Key'}
            placeholder="Type a secret key"
            value={values.secretKey}
            onChangeText={async key => {
              handleChange('secretKey')(key);

              if (!values.text) return;

              try {
                const encryptedText = await deriveKeyAndEncryptText(
                  values.text,
                  key,
                );

                setClientEncryptedText(encryptedText);
              } catch (e) {
                log.error(e);
              }
            }}
            onBlur={handleBlur('secretKey')}
          />
          {errors.secretKey && (
            <HelperText type="error">{errors.secretKey}</HelperText>
          )}
          {emails.map((email, idx) => (
            <View key={`email${idx}`}>
              <TextInput
                label={emails.length > 1 ? `Email-${idx + 1}` : 'Email'}
                onChangeText={text => {
                  setEmail(idx, text);
                }}
                onBlur={handleBlur(`email${idx}`)}
                placeholder="Type an email address"
                value={emails[idx]}
                right={
                  idx && (
                    <TextInput.Icon
                      icon="minus"
                      onPress={() => deleteEmail(idx)}
                    />
                  )
                }
              />
              {errors[`email${idx}`] && (
                <HelperText key={`error${idx}`} type="error">
                  {errors[`email${idx}`]}
                </HelperText>
              )}
            </View>
          ))}

          <TouchableOpacity
            onPress={onPressAddAnotherEmail}
            style={{
              marginTop: 16,
              flexDirection: 'row',
              gap: 6,
              alignItems: 'center',
            }}>
            <AntDesign
              name="pluscircle"
              size={20}
              color={theme.colors.tertiary}
            />
            <Text>Add another email</Text>
          </TouchableOpacity>
          {clientEncryptedText ? (
            <>
              <Text style={{marginTop: 16}}>
                Encryption is done on the client side. This is what we will see
                and save:
              </Text>
              <Text
                style={{
                  ...globalStyles.textDataView,
                  backgroundColor: colors.primaryContainer,
                }}>
                {clientEncryptedText}
              </Text>
            </>
          ) : (
            ''
          )}
          <Button
            loading={loading}
            mode={'contained'}
            onPress={e =>
              handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
            }>
            Save
          </Button>
        </View>
      )}
    </Formik>
  );
}
