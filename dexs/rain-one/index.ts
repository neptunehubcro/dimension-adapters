import { FetchOptions, SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import coreAssets from "../../helpers/coreAssets.json";

const usdt = coreAssets.arbitrum.USDT
const rainFactory = "0xccCB3C03D9355B01883779EF15C1Be09cf3623F1"
const enterOptionEvent = "event EnterOption(uint256 option, uint256 baseAmount, uint256 optionAmount,address indexed wallet)"
const PoolCreatedEvent = "event PoolCreated(address indexed poolAddress, address indexed poolCreator, string uri)"

const fetch = async (options: FetchOptions) => {
  const dailyVolume = options.createBalances()
  const poolCreationLogs = await options.getLogs({ target: rainFactory, eventAbi: PoolCreatedEvent, fromBlock: 307026817, cacheInCloud: true })
  const pools = poolCreationLogs.map(log => log.poolAddress)

  await options.streamLogs({
    noTarget: true,
    eventAbi: enterOptionEvent,
    entireLog: true,
    targetsFilter: pools,
    processor: (logs) => {
      console.log(`Processed ${Array.isArray(logs) ? logs.length : 1} enterOption logs`)
      logs.forEach((log: any) => {
        dailyVolume.add(usdt, log.args.baseAmount)
      })
    }
  })

  return { dailyVolume, }
};

const methodology = {
  Volume: "All trades on prediction markets",
};

const adapter: SimpleAdapter = {
  version: 2,
  fetch,
  chains: [CHAIN.ARBITRUM],
  start: "2025-02-17",
  methodology
};

export default adapter;