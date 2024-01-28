import {useContext, useEffect, useState} from 'react';

import {
  EncryptedDataForm,
  EncryptedDataFormVals,
} from '../forms/EncryptedDataForm';
import {decryptText, deriveKey, encryptText} from '../helpers/crpyto';
import axios from 'axios';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {Address, useAccount, useSignMessage} from 'wagmi';

export function EncryptedData() {
  const [encryptedText, setEncryptedText] = useState('');
  const [text, setText] = useState('');

  const {address} = useAccount();

  const {hostName} = useContext(HerritageWalletContext);

  const {data: signedMessage, isLoading, signMessageAsync} = useSignMessage();

  useEffect(() => {
    (async () => {
      if (!address) return;

      const token = await reqToken(hostName, address);
      const signedToken = await signMessageAsync({message: token});

      console.log({signedToken});

      const {data, status} = await axios.get(
        `${hostName}encryptedData?address=${address}&signedToken=${signedToken}`,
      );

      console.log({data, status});

      if (status === 200) {
        setEncryptedText(data.encryptedData);
      }
    })();
  }, []);

  const onSubmitEncryptedData = async (vals: EncryptedDataFormVals) => {
    if (!address) return;

    if (vals.text) {
      if (!vals.secretKey) return;

      const key = await deriveKey(vals.secretKey);

      const cipher = await encryptText(key, vals.text);

      console.log({cipher});

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

      console.log({statusSaveData});

      if (statusSaveData === 201) {
        setEncryptedText(cipher);
        setText('');
      }
    } else {
      if (!vals.secretKey) return;

      const key = await deriveKey(vals.secretKey);

      const text = await decryptText(key, encryptedText);
      console.log({text});
      setText(text);
      setEncryptedText('');
    }
  };

  return (
    <EncryptedDataForm
      onSubmit={onSubmitEncryptedData}
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
        console.error(Object.keys(e), e.code, e?.message, 'config:', e?.config),
      )) || {};

  if (status !== 200) return;

  const token = data?.token;

  return token;
}
