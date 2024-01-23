import {Formik} from 'formik';
import {FormEvent} from 'react';
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
  return (
    <View>
      <Text>{encryptedText}</Text>
      <Formik
        initialValues={{secretKey: '', text: ''}}
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
                  placeholder="Type data to encrypt"
                  value={values.text}
                  onChangeText={handleChange('text')}
                  onBlur={handleBlur('text')}>
                  {text}
                </TextInput>
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
