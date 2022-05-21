/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { NFTOpt, NFTOptInterface } from "../../contracts/NFTOpt";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "Fallback",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "Filled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "NewRequest",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "Received",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_optionId",
        type: "uint32",
      },
    ],
    name: "cancelOption",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_optionId",
        type: "uint32",
      },
    ],
    name: "createOption",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_optionId",
        type: "uint32",
      },
    ],
    name: "exerciseOption",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "optionID",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "options",
    outputs: [
      {
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        internalType: "address",
        name: "nftContract",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "nftId",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "interval",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "startDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "premium",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "strikePrice",
        type: "uint256",
      },
      {
        internalType: "enum NFTOpt.OptionFlavor",
        name: "flavor",
        type: "uint8",
      },
      {
        internalType: "enum NFTOpt.OptionState",
        name: "state",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_nftContract",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "_nftId",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "_strikePrice",
        type: "uint256",
      },
      {
        internalType: "uint32",
        name: "_interval",
        type: "uint32",
      },
      {
        internalType: "enum NFTOpt.OptionFlavor",
        name: "_flavor",
        type: "uint8",
      },
    ],
    name: "publishOptionRequest",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_optionId",
        type: "uint32",
      },
    ],
    name: "withdrawOptionRequest",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611bb1806100206000396000f3fe60806040526004361061007f5760003560e01c80635a3ddf221161004e5780635a3ddf22146101b25780636e89319a146101ce578063d0a3021e146101ea578063dd3ebfd414610206576100bf565b806312065fe0146100fa57806318b7edeb14610125578063292a274f14610150578063409e22051461016c576100bf565b366100bf577f88a5966d370b9919b20f3e2c13ff65706f196a4e32cc2c12bf57088f8852587433346040516100b5929190610e9e565b60405180910390a1005b7ffbf15a1bae5e021d024841007b692b167afd2a281a4ff0b44f47387eb388205c33346040516100f0929190610e9e565b60405180910390a1005b34801561010657600080fd5b5061010f610222565b60405161011c9190610ec7565b60405180910390f35b34801561013157600080fd5b5061013a61022a565b6040516101479190610ec7565b60405180910390f35b61016a60048036038101906101659190610f23565b610230565b005b34801561017857600080fd5b50610193600480360381019061018e9190610f7c565b610278565b6040516101a99a99989796959493929190611077565b60405180910390f35b6101cc60048036038101906101c79190610f23565b610366565b005b6101e860048036038101906101e39190610f23565b610369565b005b61020460048036038101906101ff9190610f23565b61080f565b005b610220600480360381019061021b9190611164565b610812565b005b600047905090565b60005481565b6002600160008363ffffffff16815260200190815260200160002060060160016101000a81548160ff021916908360028111156102705761026f610fb8565b5b021790555050565b60016020528060005260406000206000915090508060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060020160149054906101000a900463ffffffff16908060020160189054906101000a900463ffffffff16908060030154908060040154908060050154908060060160009054906101000a900460ff16908060060160019054906101000a900460ff1690508a565b50565b6000600160008363ffffffff1681526020019081526020016000209050600073ffffffffffffffffffffffffffffffffffffffff168160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610419576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161041090611262565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168160010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146104ac576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104a3906112f4565b60405180910390fd5b600060028111156104c0576104bf610fb8565b5b8160060160019054906101000a900460ff1660028111156104e4576104e3610fb8565b5b14610524576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161051b90611386565b60405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff168160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16036105b6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105ad906113f2565b60405180910390fd5b80600501543373ffffffffffffffffffffffffffffffffffffffff16311015610614576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161060b90611484565b60405180910390fd5b8060040154610621610222565b1015610662576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161065990611516565b60405180910390fd5b806005015434146106a8576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161069f90611582565b60405180910390fd5b338160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555042816003018190555060018160060160016101000a81548160ff0219169083600281111561071c5761071b610fb8565b5b021790555060003373ffffffffffffffffffffffffffffffffffffffff16826004015460405161074b906115d3565b60006040518083038185875af1925050503d8060008114610788576040519150601f19603f3d011682016040523d82523d6000602084013e61078d565b606091505b50509050806107d1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107c890611634565b60405180910390fd5b7fd37cf472a3f5580ea615126f95c25aaaea8c85b6b4036f6430c35a151812c855338460405161080292919061168f565b60405180910390a1505050565b50565b600073ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff1603610881576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108789061172a565b60405180910390fd5b60008463ffffffff16116108ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108c190611796565b60405180910390fd5b6108d385610d91565b610912576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161090990611828565b60405180910390fd5b3373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff16636352211e866040518263ffffffff1660e01b81526004016109629190611848565b602060405180830381865afa15801561097f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109a39190611878565b73ffffffffffffffffffffffffffffffffffffffff16146109f9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109f09061193d565b60405180910390fd5b60003411610a3c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a33906119a9565b60405180910390fd5b60008311610a7f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a7690611a15565b60405180910390fd5b60008263ffffffff1611610ac8576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610abf90611a81565b60405180910390fd5b6040518061014001604052803373ffffffffffffffffffffffffffffffffffffffff168152602001600073ffffffffffffffffffffffffffffffffffffffff1681526020018673ffffffffffffffffffffffffffffffffffffffff1681526020018563ffffffff1681526020018363ffffffff16815260200160008152602001348152602001848152602001826001811115610b6757610b66610fb8565b5b815260200160006002811115610b8057610b7f610fb8565b5b815250600160008060008154610b9590611ad0565b919050819055815260200190815260200160002060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060208201518160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060408201518160020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060608201518160020160146101000a81548163ffffffff021916908363ffffffff16021790555060808201518160020160186101000a81548163ffffffff021916908363ffffffff16021790555060a0820151816003015560c0820151816004015560e082015181600501556101008201518160060160006101000a81548160ff02191690836001811115610d1657610d15610fb8565b5b02179055506101208201518160060160016101000a81548160ff02191690836002811115610d4757610d46610fb8565b5b02179055509050507f09ade4ab65fc69d5629748282653ae32dedf754cecbe7a71b31c153f8675de7833600054604051610d82929190610e9e565b60405180910390a15050505050565b60008060007f6352211e6566aa027e75ac9dbf2423197fbd9b82b9d981a3ab367d355866aa1c6000604051602401610dc99190611b60565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff838183161783525050505090506000808251602084016000886000f19150811592505050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610e6f82610e44565b9050919050565b610e7f81610e64565b82525050565b6000819050919050565b610e9881610e85565b82525050565b6000604082019050610eb36000830185610e76565b610ec06020830184610e8f565b9392505050565b6000602082019050610edc6000830184610e8f565b92915050565b600080fd5b600063ffffffff82169050919050565b610f0081610ee7565b8114610f0b57600080fd5b50565b600081359050610f1d81610ef7565b92915050565b600060208284031215610f3957610f38610ee2565b5b6000610f4784828501610f0e565b91505092915050565b610f5981610e85565b8114610f6457600080fd5b50565b600081359050610f7681610f50565b92915050565b600060208284031215610f9257610f91610ee2565b5b6000610fa084828501610f67565b91505092915050565b610fb281610ee7565b82525050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60028110610ff857610ff7610fb8565b5b50565b600081905061100982610fe7565b919050565b600061101982610ffb565b9050919050565b6110298161100e565b82525050565b600381106110405761103f610fb8565b5b50565b60008190506110518261102f565b919050565b600061106182611043565b9050919050565b61107181611056565b82525050565b60006101408201905061108d600083018d610e76565b61109a602083018c610e76565b6110a7604083018b610e76565b6110b4606083018a610fa9565b6110c16080830189610fa9565b6110ce60a0830188610e8f565b6110db60c0830187610e8f565b6110e860e0830186610e8f565b6110f6610100830185611020565b611104610120830184611068565b9b9a5050505050505050505050565b61111c81610e64565b811461112757600080fd5b50565b60008135905061113981611113565b92915050565b6002811061114c57600080fd5b50565b60008135905061115e8161113f565b92915050565b600080600080600060a086880312156111805761117f610ee2565b5b600061118e8882890161112a565b955050602061119f88828901610f0e565b94505060406111b088828901610f67565b93505060606111c188828901610f0e565b92505060806111d28882890161114f565b9150509295509295909350565b600082825260208201905092915050565b7f4f7074696f6e2077697468207468652073706563696669656420696420646f6560008201527f73206e6f74206578697374000000000000000000000000000000000000000000602082015250565b600061124c602b836111df565b9150611257826111f0565b604082019050919050565b6000602082019050818103600083015261127b8161123f565b9050919050565b7f4f7074696f6e20697320616c72656164792066756c66696c6c6564206279206160008201527f2073656c6c657200000000000000000000000000000000000000000000000000602082015250565b60006112de6027836111df565b91506112e982611282565b604082019050919050565b6000602082019050818103600083015261130d816112d1565b9050919050565b7f4f7074696f6e206973206e6f7420696e2074686520726571756573742073746160008201527f7465000000000000000000000000000000000000000000000000000000000000602082015250565b60006113706022836111df565b915061137b82611314565b604082019050919050565b6000602082019050818103600083015261139f81611363565b9050919050565b7f53656c6c6572206973207468652073616d652061732062757965720000000000600082015250565b60006113dc601b836111df565b91506113e7826113a6565b602082019050919050565b6000602082019050818103600083015261140b816113cf565b9050919050565b7f53656c6c657220646f6573206e6f74206861766520656e6f7567682062616c6160008201527f6e63650000000000000000000000000000000000000000000000000000000000602082015250565b600061146e6023836111df565b915061147982611412565b604082019050919050565b6000602082019050818103600083015261149d81611461565b9050919050565b7f4e6f7420656e6f7567682066756e647320746f2070617920746865207072656d60008201527f69756d20746f207468652073656c6c6572000000000000000000000000000000602082015250565b60006115006031836111df565b915061150b826114a4565b604082019050919050565b6000602082019050818103600083015261152f816114f3565b9050919050565b7f57726f6e6720737472696b652070726963652070726f76696465640000000000600082015250565b600061156c601b836111df565b915061157782611536565b602082019050919050565b6000602082019050818103600083015261159b8161155f565b9050919050565b600081905092915050565b50565b60006115bd6000836115a2565b91506115c8826115ad565b600082019050919050565b60006115de826115b0565b9150819050919050565b7f5472616e73616374696f6e206661696c65640000000000000000000000000000600082015250565b600061161e6012836111df565b9150611629826115e8565b602082019050919050565b6000602082019050818103600083015261164d81611611565b9050919050565b6000819050919050565b600061167961167461166f84610ee7565b611654565b610e85565b9050919050565b6116898161165e565b82525050565b60006040820190506116a46000830185610e76565b6116b16020830184611680565b9392505050565b7f4e465420636f6e7472616374206d75737420626520612076616c69642061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b60006117146024836111df565b915061171f826116b8565b604082019050919050565b6000602082019050818103600083015261174381611707565b9050919050565b7f4e465420746f6b656e204944206d757374206265203e20300000000000000000600082015250565b60006117806018836111df565b915061178b8261174a565b602082019050919050565b600060208201905081810360008301526117af81611773565b9050919050565b7f50726f7669646564204e465420636f6e74726163742061646472657373206d7560008201527f737420696d706c656d656e74204552432d37323120696e746572666163650000602082015250565b6000611812603e836111df565b915061181d826117b6565b604082019050919050565b6000602082019050818103600083015261184181611805565b9050919050565b600060208201905061185d6000830184611680565b92915050565b60008151905061187281611113565b92915050565b60006020828403121561188e5761188d610ee2565b5b600061189c84828501611863565b91505092915050565b7f4f776e657273686970206f6620737065636966696564204e465420746f6b656e60008201527f20697320756e646572206120646966666572656e742077616c6c65742074686160208201527f6e207468652063616c6c65722773000000000000000000000000000000000000604082015250565b6000611927604e836111df565b9150611932826118a5565b606082019050919050565b600060208201905081810360008301526119568161191a565b9050919050565b7f5072656d69756d206d757374206265203e203000000000000000000000000000600082015250565b60006119936013836111df565b915061199e8261195d565b602082019050919050565b600060208201905081810360008301526119c281611986565b9050919050565b7f537472696b65207072696365206d757374206265203e20300000000000000000600082015250565b60006119ff6018836111df565b9150611a0a826119c9565b602082019050919050565b60006020820190508181036000830152611a2e816119f2565b9050919050565b7f45787069726174696f6e20696e74657276616c206d757374206265203e203000600082015250565b6000611a6b601f836111df565b9150611a7682611a35565b602082019050919050565b60006020820190508181036000830152611a9a81611a5e565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000611adb82610e85565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203611b0d57611b0c611aa1565b5b600182019050919050565b6000819050919050565b600060ff82169050919050565b6000611b4a611b45611b4084611b18565b611654565b611b22565b9050919050565b611b5a81611b2f565b82525050565b6000602082019050611b756000830184611b51565b9291505056fea26469706673582212206b0b3cb8f955b4f9b830616e0e1155ed11c5f73d89c3c3b5952b0375c768ae1864736f6c634300080e0033";

type NFTOptConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: NFTOptConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class NFTOpt__factory extends ContractFactory {
  constructor(...args: NFTOptConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<NFTOpt> {
    return super.deploy(overrides || {}) as Promise<NFTOpt>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): NFTOpt {
    return super.attach(address) as NFTOpt;
  }
  override connect(signer: Signer): NFTOpt__factory {
    return super.connect(signer) as NFTOpt__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): NFTOptInterface {
    return new utils.Interface(_abi) as NFTOptInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): NFTOpt {
    return new Contract(address, _abi, signerOrProvider) as NFTOpt;
  }
}
