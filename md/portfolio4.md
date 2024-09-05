# Chain Communicator

- GITHUB

[https://github.com/kyle-park-io/chain-communicator](https://github.com/kyle-park-io/chain-communicator)

# # 목차

---

# <서론>

# 1. RPC (Remote Procedure Call)

클라이언트는 특정 블록체인 네트워크에 대해 RPC 호출을 통하여 네트워크와 상호작용 합니다. 예를 들어, 블록 데이터 조회, 스마트 컨트랙트 호출, 트랜잭션 제출 등의 작업을 수행할 수 있습니다.

본 프로젝트 목적은 이러한 RPC 호출 과정에서 필요한 절차와 데이터를 직접 구현해보면서 블록체인 개념에 익숙해지는 것입니다.

# 2. 이더스 (Ethers.js)

이더리움 네트워크와 상호작용 시 이더스 라이브러리를 많이 사용하고는 합니다. 본 프로젝트에서는 이더스 라이브러리 내부에 구현되어 있는 일부 기능들을 코드에 반영하기 때문에, 이러한 블록체인 라이브러리에 대해 익숙해지는 효과도 기대할 수 있습니다.

# 3. 텐더민트(Tendermint) 노드

본 프로젝트에서 상호작용 하는 네트워크는 텐더민트 기반의 노드입니다. 이를 통해 이더리움 외에 다른 유명 블록체인 네트워크와 소통하는 방법도 학습할 수 있습니다.

---

# <본론>

# 0. 글의 진행 방향

본 프로젝트는 트랜잭션 데이터를 직접 생성하고 RPC 를 호출하는 과정을 다루고 있습니다. 따라서 본론의 항목 순서에 따라 트랜잭션이 생성되는 과정을 중심으로 글을 읽으면, 블록체인에 대해 쉽고 재미있게 학습을 진행할 수 있습니다.

# 1. 트랜잭션 타입 정의

블록체인 네트워크들은 각기 고유의 트랜잭션 타입이나 직렬화 방식을 가지고 있습니다. 코스모스와 텐더민트 기반 네트워크는 Protobuf 를 사용하기 때문에, 여기서는 Protobuf 를 가지고 설명하겠습니다. 트랜잭션 타입 자체보다는 타입 내의 프로퍼티들이 어떤 것들이 있는지 이해하는 것이 중요합니다.

[https://github.com/kyle-park-io/chain-communicator/blob/main/src/proto/trx.proto](https://github.com/kyle-park-io/chain-communicator/blob/main/src/proto/trx.proto)

- 트랜잭션은 **특정 계정에서 발생(수행)하는 작업이나 명령**을 나타냅니다.
  - version: 트랜잭션의 버전입니다. 이더리움에서는 `EIP - 155, 2718, 2930, 1559` 등을 통해 버전 차이를 확인할 수 있습니다.
  - time: 트랜잭션이 블록체인에 제출된 시간입니다.
  - **nonce**: 특정 계정에서 발생한 트랜잭션의 순서를 추적하는 데 사용되는 값입니다. (+1)
    - 비트코인에서의 논스(해시)와는 다른 개념입니다.
  - from: 트랜잭션을 생성한 발신자(= 특정 계정) 입니다.
  - to: 트랜잭션의 수신자 입니다. 일반 계정일 수도 있고 스마트 컨트랙트 계정일 수도 있습니다.
  - amount: 트랜잭션에 포함된 금액입니다. 블록체인 네트워크의 기축통화를 나타냅니다 (ETH)
  - gas: 스마트 컨트랙트를 포함한 트랜잭션 실행 시 사용할 최대 가스 량을 적습니다.
  - gasPrice: 현재 네트워크의 가스 단위 가격 정도로 이해하시면 됩니다.
    - gas \* gasPrice = gasFee
  - type: 트랜잭션의 유형입니다. 기본 전송(transfer), 컨트랙트(contract), 스테이킹(staking) 등이 될 수 있습니다.
  - **payload**: 트랜잭션 내의 실제 데이터 입니다. 컨트랙트 호출 인자 등이 될 수 있습니다.
  - signature: 발신자의 트랜잭션 서명값입니다.

# 2. 직렬화, 역직렬화 (마샬링, 언마샬링)

객체나 데이터 구조를 **바이트 배열로 변환**하거나 변환된 바이트 배열을 다시 원래의 데이터로 복원하는 과정입니다. 프로토버퍼 직렬화에 경우에는 Varint, ZigZag 인코딩 등이 사용된다고 알고 있습니다.

[https://github.com/kyle-park-io/chain-communicator/blob/main/src/marshal/marshal.go](https://github.com/kyle-park-io/chain-communicator/blob/main/src/marshal/marshal.go)

# 3. RLP 인코딩, 디코딩

블록체인 네트워크에서 직렬화, 역직렬화를 이야기할 때 이더리움의 방식을 빼놓을 수 없습니다. 이더리움은 이 과정에서 RLP 알고리즘을 사용합니다.

[https://github.com/kyle-park-io/chain-communicator/blob/main/src/encode/encode.go](https://github.com/kyle-park-io/chain-communicator/blob/main/src/encode/encode.go)

## 참고.

각 데이터 타입에 따라 효율적으로 사용할 수 있는 직렬화 방식이 존재합니다. 개발 시 이러한 방식을 유의해서 선택 및 진행해야 합니다. 예를 들어, 위의 트랜잭션 데이터들을 JSON 으로 직렬화 하게 되면 메모리 과부하 폭탄을 경험하실 수 있습니다 :)

# 4. 유틸리티 함수 구현

1~3 항에서 확인한 것처럼, 우리는 결국 트랜잭션 바이트 배열을 만들어 나가고 있습니다. 이를 위해 다양한 데이터 타입을 바이트 배열로 변환하거나 트랜잭션에 필요한 값들을 생성하는 유틸리티 함수들이 필요합니다.

[chain-communicator/src/utils at main · kyle-park-io/chain-communicator](https://github.com/kyle-park-io/chain-communicator/tree/main/src/utils)

- BigNumber(hex string) ↔ Bytes
- Hash(hex string) ↔ Bytes
- int, string… ↔ Bytes
- (Private, Public) key ↔ address
- Interface(Abi…) ↔ Bytes

# 5. Build Transaciton

앞서 구현한 함수들을 이용해 트랜잭션 데이터를 만들 수 있습니다! 트랜잭션에 사용되는 인자 중 nonce 와 같이 네트워크에 요청해야 하는 값도 있는데, 이에 대해서는 아래에 RPC 호출 섹션에서 다루겠습니다.

[https://github.com/kyle-park-io/chain-communicator/blob/main/src/utils/build-tx.go](https://github.com/kyle-park-io/chain-communicator/blob/main/src/utils/build-tx.go)

# 6. 트랜잭션 Prefix

트랜잭션 서명 시 데이터에 문자열 prefix 를 추가함으로써 여러 네트워크 간의 데이터를 명확히 구분하거나 유효하지 않은 트랜잭션을 식별할 수 있습니다.

다시 말해, 다른 네트워크 간의 재사용 공격(reply attack) 을 방지할 수 있습니다.

[https://github.com/kyle-park-io/chain-communicator/blob/main/src/constant/constant.go](https://github.com/kyle-park-io/chain-communicator/blob/main/src/constant/constant.go)

# 7. 서명

생성한 트랜잭션 데이터에 서명을 진행합니다.

[https://github.com/kyle-park-io/chain-communicator/blob/main/src/utils/sign.go](https://github.com/kyle-park-io/chain-communicator/blob/main/src/utils/sign.go)

# 8. RPC 호출

데이터를 올바르게 생성했으니, 이제 이를 네트워크에 전파할 일만 남았습니다.

## 1. Get

계정의 논스, 네트워크 상태, 가스 단위 가격 등을 RPC 호출을 통해 가져올 수 있습니다.

[https://github.com/kyle-park-io/chain-communicator/blob/main/src/rpc/tendermint_rpc_get.go](https://github.com/kyle-park-io/chain-communicator/blob/main/src/rpc/tendermint_rpc_get.go)

## 2. Post

네트워크의 트랜잭션을 쓩하고 전파합시다.

[https://github.com/kyle-park-io/chain-communicator/blob/main/src/rpc/tendermint_rpc_post.go](https://github.com/kyle-park-io/chain-communicator/blob/main/src/rpc/tendermint_rpc_post.go)

# 9. 통합 코드

## 1. Transfer

기본 트랜스퍼 통합 코드입니다.

[https://github.com/kyle-park-io/chain-communicator/blob/main/src/internal/transfer.go](https://github.com/kyle-park-io/chain-communicator/blob/main/src/internal/transfer.go)

## 2. Contract

컨트랙트 호출 및 쿼리 통합 코드입니다.

[https://github.com/kyle-park-io/chain-communicator/blob/main/src/internal/contract.go](https://github.com/kyle-park-io/chain-communicator/blob/main/src/internal/contract.go)

---

# <결론>

트랜잭션을 생성하고, 이를 RPC 호출을 통해 네트워크에 전파하는 과정까지 마무리했습니다. 여러 라이브러리, SDK, 애플리케이션도 이와 같은 방식으로 네트워크와 상호작용합니다. 이번 프로젝트를 통해 블록체인 개념과 내부 프로세스를 이해하는 데 조금이나마 도움이 되었기를 바랍니다 :)
