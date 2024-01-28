import {Formik} from 'formik';
import {FormEvent, useEffect, useState} from 'react';
import {Button, Text, TextInput, View} from 'react-native';

export type EncryptedDataFormVals = {
  secretKey: string;
  encryptedText?: string;
  text?: string;
};

export function EncryptedDataForm({
  encryptedText,
  onSubmit,
  deriveKeyAndEncryptText,
  text,
}: {
  encryptedText?: string;
  onSubmit: (values: EncryptedDataFormVals) => void;
  deriveKeyAndEncryptText: (text: string, secretKey) => Promise<string>;
  text?: string;
}) {
  const [encryptedTextSample, setEncryptedTextSample] = useState('');

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
                {encryptedTextSample ? (
                  <Text>This is what we see: {encryptedTextSample}</Text>
                ) : (
                  ''
                )}
                <Text>Type your secret data below:</Text>
                <TextInput
                  multiline={true}
                  placeholder={'Type data to encrypt'}
                  value={values.text}
                  onChangeText={async text => {
                    handleChange('text')(text);

                    if (text) {
                      try {
                        const encryptedText = await deriveKeyAndEncryptText(
                          text,
                          values.secretKey,
                        );

                        setEncryptedTextSample(encryptedText);
                      } catch (e) {
                        console.error(e);
                      }
                    } else {
                      setEncryptedTextSample('');
                    }
                  }}
                  onBlur={handleBlur('text')}
                />
                <TextInput
                  placeholder="Type your secret key"
                  value={values.secretKey}
                  onChangeText={async key => {
                    handleChange('secretKey')(key);

                    if (!values.text) return;

                    try {
                      const encryptedText = await deriveKeyAndEncryptText(
                        values.text,
                        key,
                      );

                      setEncryptedTextSample(encryptedText);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
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
