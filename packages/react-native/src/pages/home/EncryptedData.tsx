import {useContext, useEffect, useState} from 'react';
import {useAccount, useSignMessage} from 'wagmi';
import axios from 'axios';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('EncryptedData');

import {decryptText, deriveKey, encryptText} from '../../helpers/crpyto';
import {
  getEncryptedData,
  getUrl,
  authGet,
  postEncryptedData,
} from '../../utils/api';
import {AppStateContext} from '../../context/AppState.context';
import {Loading} from '../../molecules/Loading';
import {
  DataEncryptionForm,
  EncryptedDataFormVals,
} from '../../forms/DataEncryptionForm';
import {
  DataDecryptionForm,
  DataDecryptionFormVals,
} from '../../forms/DataDecryptionForm';
import {useRefreshAuthenticationToken} from '../../hooks/useRefreshAuthenticationToken';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AUTHENTICATION_TOKEN} from '../../utils/constants';

export function EncryptedData() {
  const {setError, setSuccess} = useContext(AppStateContext);

  const [encryptedText, setEncryptedText] = useState('');
  const [initialText, setInitialText] = useState('');
  const [initialEmails, setInitialEmails] = useState(['']);
  const [showEditForm, setShowEditForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const {address} = useAccount();

  const {isLoading: isLoadingSign, signMessageAsync} = useSignMessage();
  const {refresh: refreshAuth} = useRefreshAuthenticationToken();

  useEffect(() => {
    (async () => {
      try {
        if (!address) {
          log.error('Address can not be found.');
          return;
        }
        setIsPageLoading(true);

        const authToken = (await AsyncStorage.getItem(
          AUTHENTICATION_TOKEN,
        )) as `0x${string}`;

        if (!authToken) {
          log.debug('No auth token found.');
          await refreshAuth();
          setIsPageLoading(false);
          return;
        }

        const {status, data} = await getEncryptedData(address, authToken);

        if (status === 200) {
          setEncryptedText(data.encryptedData);
          setInitialEmails(data.emails);
          setShowEditForm(false);
        } else if (status === 501) {
          await refreshAuth();
        }
      } catch (e) {
        log.error(e);

        // This rerenders the component and causes an infinite loop
        // setError({message: 'An error occured. Try again.'});
      }

      setIsPageLoading(false);
    })();
  }, []);

  const onSubmitEncryptedData = async (vals: EncryptedDataFormVals) => {
    if (!address || !vals.clientEncryptedText) return;

    setIsLoading(true);

    try {
      const token = await authGet(address);

      const signedToken = await signMessageAsync({message: token});

      const data = JSON.stringify({
        signedToken,
        address,
        encryptedData: vals.clientEncryptedText,
        emails: vals.emails,
      });

      const {status: statusSaveData} = await postEncryptedData(address, data);

      log.info({statusSaveData});

      if (statusSaveData === 201) {
        setSuccess({message: 'Data has encrypted and saved successfully.'});
        setEncryptedText(vals.clientEncryptedText);
        setInitialEmails(vals.emails);
        setShowEditForm(false);
      }

      setIsLoading(false);
    } catch (e) {
      log.error(e);
      setError({message: 'An error occured. Try again.'});
      setIsLoading(false);
    }
  };

  const onSubmitDecrypt = async (vals: DataDecryptionFormVals) => {
    if (!vals.secretKey) return;

    setIsLoading(true);

    try {
      const key = await deriveKey(vals.secretKey);

      const decryptedText = await decryptText(key, encryptedText);
      log.info({decryptedText});

      setInitialText(decryptedText);
      setShowEditForm(true);
      setIsLoading(false);
    } catch (e) {
      log.error(e);
      setIsLoading(false);
    }
  };

  const deriveKeyAndEncryptText = async (text: string, secretKey: string) => {
    const key = await deriveKey(secretKey || 'foo');

    const cipher = await encryptText(key, text);

    return cipher;
  };

  if (isPageLoading) return <Loading />;

  if (showEditForm)
    return (
      <DataEncryptionForm
        onSubmit={onSubmitEncryptedData}
        deriveKeyAndEncryptText={deriveKeyAndEncryptText}
        initialText={initialText}
        initialEmails={initialEmails}
        loading={isLoadingSign || isLoading}
      />
    );

  return (
    <DataDecryptionForm
      initialEncryptedText={encryptedText}
      onSubmitDecrypt={onSubmitDecrypt}
      loading={isLoadingSign || isLoading}
    />
  );
}
