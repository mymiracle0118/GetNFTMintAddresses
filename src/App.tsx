import { useEffect, useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SnackbarProvider } from 'notistack';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

export default function App(){
  const connection = new Connection("https://solana-api.projectserum.com/");
  const MAX_NAME_LENGTH = 32;
  const MAX_URI_LENGTH = 200;
  const MAX_SYMBOL_LENGTH = 10;
  const MAX_CREATOR_LEN = 32 + 1 + 1;
  const MAX_CREATOR_LIMIT = 5;
  const MAX_DATA_SIZE = 4 + MAX_NAME_LENGTH + 4 + MAX_SYMBOL_LENGTH + 4 + MAX_URI_LENGTH + 2 + 1 + 4 + MAX_CREATOR_LIMIT * MAX_CREATOR_LEN;
  const MAX_METADATA_LEN = 1 + 32 + 32 + MAX_DATA_SIZE + 1 + 1 + 9 + 172;
  const CREATOR_ARRAY_START = 1 + 32 + 32 + 4 + MAX_NAME_LENGTH + 4 + MAX_URI_LENGTH + 4 + MAX_SYMBOL_LENGTH + 2 + 1 + 4;

  const TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  const CANDY_MACHINE_V2_PROGRAM = new PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ');
  const candyMachineId = new PublicKey('3E5PGLLXCz4fqxVzYsDAckNqHGjUEnKQRrwAW5rmqECs');
  const candyMachineCreator = new PublicKey('3E5PGLLXCz4fqxVzYsDAckNqHGjUEnKQRrwAW5rmqECs');

  const getMintAddresses = async (firstCreatorAddress: PublicKey) => {
    const metadataAccounts = await connection.getProgramAccounts(
      TOKEN_METADATA_PROGRAM,
      {
        // The mint address is located at byte 33 and lasts for 32 bytes.
        dataSlice: { offset: 33, length: 32 },
  
        filters: [
          // Only get Metadata accounts.
          { dataSize: MAX_METADATA_LEN },
  
          // Filter using the first creator.
          {
            memcmp: {
              offset: CREATOR_ARRAY_START,
              bytes: firstCreatorAddress.toBase58(),
            },
          },
        ],
      }
    );
 
    console.log("data", metadataAccounts);

    return metadataAccounts.map((metadataAccountInfo) =>
      bs58.encode(metadataAccountInfo.account.data)
    );
  };

  const getAddress = async (candyMachineId: any) => {
    const data = await getMintAddresses(candyMachineCreator);
    console.log(data);
  }

  useEffect(() =>{
    console.log("get mint address");
    getAddress(candyMachineId);
  }, [])


  //Not working
  const getCandyMachineCreator = async (candyMachine: PublicKey): Promise<[PublicKey, number]> => (
      PublicKey.findProgramAddress(
          [Buffer.from('candy_machine'), candyMachine.toBuffer()],
          CANDY_MACHINE_V2_PROGRAM,
      )
  );

  return (
    <div>
      <h1>Get Mint Addresses</h1>
    </div>
  );  
}