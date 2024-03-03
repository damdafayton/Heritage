import {useContext, useEffect, useState} from 'react';
import {useAccount, useSignMessage} from 'wagmi';
import axios from 'axios';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('EncryptedData');

import {decryptText, deriveKey, encryptText} from '../../helpers/crpyto';
import {getEncryptedData, getUrl, authGet} from '../../utils/api';
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
  const {authToken} = useContext(AppStateContext);
  const {refresh: refreshAuth} = useRefreshAuthenticationToken();

  useEffect(() => {
    (async () => {
      try {
        if (!address) {
          log.error('Address can not be found.');
          return;
        }

        if (authToken) {
          const {status, data} = await getEncryptedData(address, authToken);

          log.info({data: JSON.stringify(data), status});

          if (status === 200) {
            setEncryptedText(data.encryptedData);
            setInitialEmails(data.emails);
            setShowEditForm(false);
          } else if (status === 501) {
            await refreshAuth();
          }
        } else {
          await refreshAuth();
        }

        setIsPageLoading(false);
      } catch (e) {
        log.error(e);
        setIsPageLoading(false);
      }
    })();
  }, [setIsPageLoading, authToken]);

  const onSubmitEncryptedData = async (vals: EncryptedDataFormVals) => {
    if (!address || !vals.clientEncryptedText) return;

    setIsLoading(true);

    try {
      const token = await authGet(address);

      const signedToken = await signMessageAsync({message: token});

      const url = getUrl('encryptedData');
      const {status: statusSaveData} = await axios.post(url, {
        data: JSON.stringify({
          signedToken,
          address,
          encryptedData: vals.clientEncryptedText,
          emails: vals.emails,
        }),
      });

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
