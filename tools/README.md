# tools/

Native `gltfpack` binary, used by `npm run assets:models`.

The npm package (`gltfpack` on the registry) ships without BasisU support on
Node — texture compression silently no-ops. The real thing has to come from
the project's GitHub releases.

## Setup

```sh
curl -sL -o /tmp/gltfpack.zip \
  https://github.com/zeux/meshoptimizer/releases/download/v1.2/gltfpack-macos.zip
unzip -o -q /tmp/gltfpack.zip -d tools/
chmod +x tools/gltfpack
xattr -d com.apple.quarantine tools/gltfpack   # macOS Gatekeeper
```

Swap `gltfpack-macos.zip` for `gltfpack-ubuntu.zip` / `gltfpack-windows.zip` on
other platforms (see the [releases page](https://github.com/zeux/meshoptimizer/releases)).

`tools/gltfpack` itself isn't committed (binary, platform-specific) — see
`.gitignore`. Re-run the setup step after a clean clone.
