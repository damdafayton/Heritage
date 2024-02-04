import {ReactElement} from 'react';
import {TransactionBase, TransactionReceipt, formatEther} from 'viem';

type DisplayContent =
  | string
  | number
  | bigint
  | Record<string, any>
  | TransactionBase
  | TransactionReceipt
  | undefined
  | unknown;

export const displayTxResult = (
  displayContent: DisplayContent | DisplayContent[],
  asText = false,
): string | ReactElement | number => {
  if (displayContent == null) {
    return '';
  }

  if (typeof displayContent === 'bigint') {
    try {
      const asNumber = Number(displayContent);
      if (
        asNumber <= Number.MAX_SAFE_INTEGER &&
        asNumber >= Number.MIN_SAFE_INTEGER
      ) {
        return asNumber;
      } else {
        return 'Ξ' + formatEther(displayContent);
      }
    } catch (e) {
      return 'Ξ' + formatEther(displayContent);
    }
  }

  if (
    typeof displayContent === 'string' &&
    displayContent.indexOf('0x') === 0 &&
    displayContent.length === 42
  ) {
    return asText ? displayContent : displayContent;
  }

  if (Array.isArray(displayContent)) {
    const mostReadable = (v: DisplayContent) =>
      ['number', 'boolean'].includes(typeof v) ? v : displayTxResultAsText(v);
    const displayable = JSON.stringify(
      displayContent.map(mostReadable),
      replacer,
    );

    return asText ? (
      displayable
    ) : (
      <span style={{overflowWrap: 'break-word', width: '100%'}}>
        {displayable.replaceAll(',', ',\n')}
      </span>
    );
  }

  return JSON.stringify(displayContent, replacer, 2);
};

const displayTxResultAsText = (displayContent: DisplayContent) =>
  displayTxResult(displayContent, true);

// To be used in JSON.stringify when a field might be bigint
// https://wagmi.sh/react/faq#bigint-serialization
export const replacer = (_key: string, value: unknown) =>
  typeof value === 'bigint' ? value.toString() : value;
