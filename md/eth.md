# 이더리움 이벤트 객체

```jsx
Event:  ContractEventPayload {
  filter: 'Transfer',
  emitter: <ref *1> Contract {
    target: '0xA38467B3eb43Be97af151F3ACEdC62eAc8dC3C90',
		-> 호출 컨트랙트 주소
    interface: Interface {
      fragments: [Array],
      deploy: [ConstructorFragment],
      fallback: [FallbackFragment],
      receive: true
    },
    runner: Wallet {
      provider: JsonRpcProvider {},
      address: '0xb49aBD4101ED3a275Fb9Bba9b532688a41D52Be9'
    },
		-> 이벤트 연결 인스턴스 주소
    filters: {},
    fallback: [AsyncFunction: method] {
      _contract: [Circular *1],
      estimateGas: [AsyncFunction: estimateGas],
      populateTransaction: [AsyncFunction: populateTransaction],
      send: [AsyncFunction: send],
      staticCall: [AsyncFunction: staticCall]
    },
    [Symbol(_ethersInternal_contract)]: {}
  },
  log: EventLog {
    provider: JsonRpcProvider {},
    transactionHash: '0xedbc7f4ede7dc26711ab323c4fa48a46569df5b75dfe5411bab0e467c84c0a9f',
    blockHash: '0x4ce72082a13f18a5c507971cd16f988a32d4bc54324767df56b81ee1f0eb8a9b',
    blockNumber: 615,
    removed: false,
    address: '0xA38467B3eb43Be97af151F3ACEdC62eAc8dC3C90',
		**-> 호출 컨트랙트 주소**
    data: '0x0000000000000000000000000000000000000000000000008ac7230489e80000',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000a4f7d892e2f692e3acae76f02a3be54b3130f721',
      '0x0000000000000000000000007909f484115f4259dad70a0f9bd613019376944c'
    ],
    index: 1,
    transactionIndex: 0,
    interface: Interface {
      fragments: [Array],
      deploy: [ConstructorFragment],
      fallback: [FallbackFragment],
      receive: true
    },
    fragment: EventFragment {
      type: 'event',
      inputs: [Array],
      name: 'Transfer',
      anonymous: false
    },
    args: Result(3) [
      '0xA4f7D892e2F692E3aCaE76f02a3be54B3130F721',
      '0x7909F484115F4259dad70a0F9bD613019376944c',
      10000000000000000000n
    ]
  },
  args: Result(3) [
    '0xA4f7D892e2F692E3aCaE76f02a3be54B3130F721',
    '0x7909F484115F4259dad70a0F9bD613019376944c',
    10000000000000000000n
  ],
  fragment: EventFragment {
    type: 'event',
    inputs: [ [ParamType], [ParamType], [ParamType] ],
    name: 'Transfer',
    anonymous: false
  }
}
```
