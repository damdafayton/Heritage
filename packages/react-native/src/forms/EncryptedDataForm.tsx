import {Formik} from 'formik';
import {FormEvent, useEffect} from 'react';
import {Button, Text, TextInput, View} from 'react-native';

export type EncryptedDataFormVals = {
  secretKey: string;
  encryptedText?: string;
  text?: string;
};

export function EncryptedDataForm({
  encryptedText,
  onSubmit,
  text,
}: {
  encryptedText?: string;
  onSubmit: (values: EncryptedDataFormVals) => void;
  text?: string;
}) {
  useEffect(() => {
    console.log('useEffect text:', text);
  }, [text]);

  return (
    <View>
      <Formik
        enableReinitialize={true}
        initialValues={{secretKey: '', text: text}}
        validateOnChange={false}
        onSubmit={async (values, {resetForm}) => {
          await onSubmit(values);

          resetForm();
        }}>
        {({handleChange, handleBlur, handleSubmit, values, errors}) => (
          <View>
            {encryptedText ? (
              <View>
                <Text>{encryptedText}</Text>
                <TextInput
                  placeholder="Type your secret key"
                  value={values.secretKey}
                  onChangeText={handleChange('secretKey')}
                  onBlur={handleBlur('secretKey')}
                />
                <Button
                  onPress={e =>
                    handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
                  }
                  title="Decrypt"
                />
              </View>
            ) : (
              <View>
                <TextInput
                  multiline={true}
                  placeholder={'Type data to encrypt'}
                  value={values.text}
                  onChangeText={handleChange('text')}
                  onBlur={handleBlur('text')}
                />
                <TextInput
                  placeholder="Type your secret key"
                  value={values.secretKey}
                  onChangeText={handleChange('secretKey')}
                  onBlur={handleBlur('secretKey')}
                />
                <Button
                  onPress={e =>
                    handleSubmit(e as unknown as FormEvent<HTMLFormElement>)
                  }
                  title="Encrypt"
                />
              </View>
            )}
          </View>
        )}
      </Formik>
    </View>
  );
}
