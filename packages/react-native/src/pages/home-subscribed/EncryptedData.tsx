import {useContext, useEffect, useState} from 'react';

import axios from 'axios';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('EncryptedData');

import {useAccount, useSignMessage} from 'wagmi';

import {decryptText, deriveKey, encryptText} from '../../helpers/crpyto';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {reqToken} from '../../utils/api';
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

export function EncryptedData() {
  const {setError, setSuccess} = useContext(AppStateContext);

  const [encryptedText, setEncryptedText] = useState('');
  const [initialText, setInitialText] = useState('');
  const [initialEmails, setInitialEmails] = useState(['']);
  const [showEditForm, setShowEditForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const {address} = useAccount();

  const {hostName} = useContext(HerritageWalletContext);

  const {isLoading: isLoadingSign, signMessageAsync} = useSignMessage();

  useEffect(() => {
    (async () => {
      try {
        if (!address) {
          setError({message: 'An error occured. Refresh the page.'});
          return;
        }

        const token = await reqToken(hostName, address);

        if (!token) {
          setIsPageLoading(false);
          return;
        }

        const signedToken = await signMessageAsync({message: token});

        log.info({signedToken});

        const {data, status} = await axios.get(
          `${hostName}encryptedData?address=${address}&signedToken=${signedToken}`,
        );

        log.info({data: JSON.stringify(data), status});

        if (status === 200) {
          setEncryptedText(data.encryptedData);
          setInitialEmails(data.emails);
          setShowEditForm(false);
        }

        setIsPageLoading(false);
      } catch (e) {
        log.error(e);
        setIsPageLoading(false);
      }
    })();
  }, []);

  const onSubmitEncryptedData = async (vals: EncryptedDataFormVals) => {
    if (!address || !vals.clientEncryptedText) return;

    setIsLoading(true);

    try {
      const token = await reqToken(hostName, address);

      const signedToken = await signMessageAsync({message: token});

      const {status: statusSaveData} = await axios.post(
        `${hostName}encryptedData`,
        {
          data: JSON.stringify({
            signedToken,
            address,
            encryptedData: vals.clientEncryptedText,
            emails: vals.emails,
          }),
        },
      );

      log.info({statusSaveData});

      if (statusSaveData === 201) {
        setEncryptedText(vals.clientEncryptedText);
        setInitialEmails(vals.emails);
        setShowEditForm(false);
      }

      setIsLoading(false);
    } catch (e) {
      log.error(e);
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
