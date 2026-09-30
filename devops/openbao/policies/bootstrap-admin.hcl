# Temporary administrative policy used during OpenBao bootstrap.
# Do NOT use this policy for application workloads.

# Policy management / system administration
path "sys/*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# Authentication configuration
path "auth/*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}

# KV v2 secret data
path "secret/data/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# KV v2 metadata
path "secret/metadata/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# KV v2 version operations
path "secret/delete/*" {
  capabilities = ["update"]
}

path "secret/undelete/*" {
  capabilities = ["update"]
}

path "secret/destroy/*" {
  capabilities = ["update"]
}