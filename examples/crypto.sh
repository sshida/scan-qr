#!/usr/bin/env bash
# vi: ts=2 sts=2
#
# 注意: openssl encコマンドはAEAD非対応。authを分けて表示しない
set -euo pipefail

# (date; echo rut240 $RAND; echo $RAND; echo $RAND) | sha256sum | cut -d ' ' -f 1
CIPHER_KEY=1838cb4996b8da2d65ea5a12df99062299bb9cf34da01c229051795f8f8ad783
# (date; echo rut240 $RAND; echo $RAND; echo $RAND) | sha256sum | cut -b 1-32
IV=1860f14180ea996fa960a16778fb692f

encrypt_string() {
  local plain_string="$1"

  echo -n "$plain_string" | openssl enc -aes-256-cbc \
		-e \
		-K $CIPHER_KEY \
		-iv $IV \
		-base64 \

}

decrypt_string() {
  local cipher_base64_string="$1"

  echo "$cipher_base64_string" | openssl enc -aes-256-cbc \
		-d \
		-K $CIPHER_KEY \
		-iv $IV \
		-base64 \

	echo
}

plain_text="hello world"
echo plain: $plain_text
cipher_text=$(encrypt_string "$plain_text")
echo cipher: $cipher_text
decrypted_text=$(decrypt_string "$cipher_text")
echo decode: $decrypted_text

[ "$plain_text" = "$decrypted_text" ] && echo "ok" || {
	echo "Error: not matched" >&2
  exit 1
}
