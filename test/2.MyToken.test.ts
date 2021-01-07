import {expect, use} from 'chai';
import {Contract} from 'ethers';
import {deployContract, MockProvider, solidity} from 'ethereum-waffle';
import MyToken from '../build/MyToken.json';
import EtherSplitter from '../build/EtherSplitter.json';

use(solidity);

const addressZero = '0x0000000000000000000000000000000000000000'

describe.only('MyToken', () => {
  const [wallet, walletTo, walletFrom, splitter, first, second] = new MockProvider().getWallets();
  let token: Contract;
  let splitterContract: Contract;

  beforeEach(async () => {
    token = await deployContract(wallet, MyToken, [1000]);
    splitterContract = await deployContract(wallet, EtherSplitter, [first.address, second.address, token.address]);
  });

  it('Assigns initial balance', async () => {
    expect(await token.balanceOf(wallet.address)).to.equal(1000);
  });

  it('Transfer adds amount to destination account', async () => {
    await token.transfer(walletTo.address, 7);
    expect(await token.balanceOf(walletTo.address)).to.equal(7);
  });

  it('Transfer emits event', async () => {
    await expect(token.transfer(walletTo.address, 7))
      .to.emit(token, 'Transfer')
      .withArgs(wallet.address, walletTo.address, 7);
  });

  it('Can not transfer above the amount', async () => {
    await token.transfer(walletTo.address, 7);
    await expect(token.transfer(walletTo.address, 1000)).to.be.reverted;
  });

  it('Can not transfer less than owned', async () => {
    await expect(token.transfer(walletTo.address, 1007)).to.be.reverted;
  });

  it('Can not transfer to address zero', async () => {
    await expect(token.transfer(addressZero, 7)).to.be.reverted;
  });

  it('Can not transfer from empty account', async () => {
    const tokenFromOtherWallet = token.connect(walletTo);
    await expect(tokenFromOtherWallet.transfer(wallet.address, 1)).to.be.reverted;
  });

  it('Returns 0 for not approved accounts', async () => {
    expect(await token.allowance(walletFrom.address, splitter.address)).to.equal(0);
  });

  it('Approves account allowance', async () => {
    await token.transfer(walletFrom.address, 10);
    const tokenWithWalletFrom = token.connect(walletFrom)
    await tokenWithWalletFrom.approve(splitter.address, 8);
    expect( await token.allowance(walletFrom.address, splitter.address) ).to.equal(8);
  });

  it('Allows to spend allowed amount', async () => {
    await token.transfer(walletFrom.address, 10);
    const tokenWithWalletFrom = token.connect(walletFrom);
    await tokenWithWalletFrom.approve(splitter.address, 8);
    const tokenWithSplitter = token.connect(splitter);

    await tokenWithSplitter.transferFrom(walletFrom.address, walletTo.address, 8);

    expect(await token.balanceOf(walletTo.address)).to.equal(8);
  });

  it('Splits token amount', async () => {
    await token.transfer(walletFrom.address, 10);
    const tokenWithWalletFrom = token.connect(walletFrom);
    await tokenWithWalletFrom.approve(splitterContract.address, 8);

    expect(await token.balanceOf(first.address)).to.equal(0);
    expect(await token.balanceOf(second.address)).to.equal(0);

    await splitterContract.connect(walletFrom).splitToken()

    expect(await token.balanceOf(first.address)).to.equal(4);
    expect(await token.balanceOf(second.address)).to.equal(4);
  });

  it('Throws if not approved', async () => {
    await token.transfer(walletFrom.address, 10);
    const tokenWithWalletFrom = token.connect(walletFrom);
    // await tokenWithWalletFrom.approve(splitterContract.address, 8);

    expect(await token.balanceOf(first.address)).to.equal(0);
    expect(await token.balanceOf(second.address)).to.equal(0);

    await expect(splitterContract.connect(walletFrom).splitToken()).to.be.revertedWith('Cannot split zero');

    expect(await token.balanceOf(first.address)).to.equal(0);
    expect(await token.balanceOf(second.address)).to.equal(0);
  });
});
