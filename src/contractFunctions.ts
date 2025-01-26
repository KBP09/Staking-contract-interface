import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";

type StakeParams = {
  userAccount: string;
  privateKey: string;
  stakingContract: Contract<AbiItem[]>;
  erc20Abi: AbiItem[];
  amount: string;
};

const web3 = new Web3("infura ya alchemy ka url");

export const stakeTokens = async ({
  userAccount,
  privateKey,
  stakingContract,
  erc20Abi,
  amount,
}: StakeParams): Promise<void> => {
  const stakingTokenAddress = await stakingContract.methods.stakingToken().call();
  
  if (typeof stakingTokenAddress !== "string" || stakingTokenAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("Invalid staking token address");
  }
 
  const stakingToken = new web3.eth.Contract(erc20Abi, stakingTokenAddress);


  const approveTx = stakingToken.methods.approve(stakingContract.options.address, amount);
  const approveData = approveTx.encodeABI();
  const approveGas = await approveTx.estimateGas({ from: userAccount });

  const approveTxSigned = await web3.eth.accounts.signTransaction(
    {
      to: stakingTokenAddress,
      data: approveData,
      gas: approveGas,
    },
    privateKey
  );

  await web3.eth.sendSignedTransaction(approveTxSigned.rawTransaction!);


  const stakeTx = stakingContract.methods.stake(amount);
  const stakeData = stakeTx.encodeABI();
  const stakeGas = await stakeTx.estimateGas({ from: userAccount });

  const stakeTxSigned = await web3.eth.accounts.signTransaction(
    {
      to: stakingContract.options.address,
      data: stakeData,
      gas: stakeGas,
    },
    privateKey
  );

  await web3.eth.sendSignedTransaction(stakeTxSigned.rawTransaction!);
};


export const claimRewards = async (
  userAccount: string,
  privateKey: string,
  stakingContract: Contract<AbiItem[]>
): Promise<void> => {
  const claimTx = stakingContract.methods.claimRewards();
  const claimData = claimTx.encodeABI();
  const claimGas = await claimTx.estimateGas({ from: userAccount });

  const claimTxSigned = await web3.eth.accounts.signTransaction(
    {
      to: stakingContract.options.address,
      data: claimData,
      gas: claimGas,
    },
    privateKey
  );

  await web3.eth.sendSignedTransaction(claimTxSigned.rawTransaction!);
};


export const withdrawTokens = async (
  userAccount: string,
  privateKey: string,
  stakingContract: Contract<AbiItem[]>,
  stakeIds: number[],
  totalAmount: string
): Promise<void> => {
  const withdrawTx = stakingContract.methods.withdraw(stakeIds, totalAmount);
  const withdrawData = withdrawTx.encodeABI();
  const withdrawGas = await withdrawTx.estimateGas({ from: userAccount });

  const withdrawTxSigned = await web3.eth.accounts.signTransaction(
    {
      to: stakingContract.options.address,
      data: withdrawData,
      gas: withdrawGas,
    },
    privateKey
  );

  await web3.eth.sendSignedTransaction(withdrawTxSigned.rawTransaction!);
};


export const getUserRewards = async (
  stakingContract: Contract<AbiItem[]>,
  userAddress: string
): Promise<string> => {
  return await stakingContract.methods.getUserAccruedRewards(userAddress).call();
};


export const canWithdraw = async (
  stakingContract: Contract<AbiItem[]>,
  userAddress: string,
  stakeId: number
): Promise<boolean> => {
  return await stakingContract.methods.canWithdraw(userAddress, stakeId).call();
};
