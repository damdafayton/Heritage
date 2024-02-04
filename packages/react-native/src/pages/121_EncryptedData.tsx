import {useContext, useEffect, useState} from 'react';

import axios from 'axios';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('EncryptedData');

import {Address, useAccount, useSignMessage} from 'wagmi';

import {
  EncryptedDataForm,
  EncryptedDataFormVals,
} from '../forms/EncryptedDataForm';
import {decryptText, deriveKey, encryptText} from '../helpers/crpyto';
import {HerritageWalletContext} from '../context/HerritageWallet.context';

export function EncryptedData() {
  const [encryptedText, setEncryptedText] = useState('');
  const [text, setText] = useState('');

  const {address} = useAccount();

  const {hostName} = useContext(HerritageWalletContext);

  const {isLoading, signMessageAsync} = useSignMessage();

  useEffect(() => {
    (async () => {
      if (!address) return;

      const token = await reqToken(hostName, address);
      const signedToken = await signMessageAsync({message: token});

      log.info({signedToken});

      const {data, status} = await axios.get(
        `${hostName}encryptedData?address=${address}&signedToken=${signedToken}`,
      );

      log.info({data, status});

      if (status === 200) {
        setEncryptedText(data.encryptedData);
      }
    })();
  }, []);

  const onSubmitEncryptedData = async (vals: EncryptedDataFormVals) => {
    if (!address) return;

    if (vals.text) {
      if (!vals.secretKey) return;

      const cipher = await deriveKeyAndEncryptText(vals.text, vals.secretKey);

      log.info({cipher});

      const token = await reqToken(hostName, address);
      const signedToken = await signMessageAsync({message: token});

      const {status: statusSaveData} = await axios.post(
        `${hostName}encryptedData`,
        {
          data: JSON.stringify({
            signedToken,
            address,
            encryptedData: cipher,
          }),
        },
      );

      log.info({statusSaveData});

      if (statusSaveData === 201) {
        setEncryptedText(cipher);
        setText('');
      }
    } else {
      if (!vals.secretKey) return;

      const key = await deriveKey(vals.secretKey);

      const text = await decryptText(key, encryptedText);
      log.info({text});

      setText(text);
      setEncryptedText('');
    }
  };

  const deriveKeyAndEncryptText = async (text: string, secretKey: string) => {
    const key = await deriveKey(secretKey || 'foo');

    const cipher = await encryptText(key, text);

    return cipher;
  };

  return (
    <EncryptedDataForm
      onSubmit={onSubmitEncryptedData}
      deriveKeyAndEncryptText={deriveKeyAndEncryptText}
      encryptedText={encryptedText}
      text={text}
    />
  );
}

async function reqToken(hostName, address: Address) {
  const {data, status} =
    (await axios
      .get(`${hostName}auth?address=${address}`)
      .catch(e =>
        log.error(Object.keys(e), e.code, e?.message, 'config:', e?.config),
      )) || {};

  if (status !== 200) return;

  const token = data?.token;

  return token;
}
