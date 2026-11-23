"""Offline proof of the website arbiter's deploy-on-success exit handler."""
import os
import shutil
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "arbiter-merge.yml"
BASH = shutil.which("bash") or r"C:\Program Files\Git\bin\bash.exe"


class DeployDispatchTest(unittest.TestCase):
    def run_trap(self, body, dispatch_result=0):
        source = WORKFLOW.read_text(encoding="utf-8")
        block = source.split("        run: |\n", 1)[1].split("          prs=", 1)[0]
        prefix = "\n".join(line[10:] for line in block.splitlines())
        script = ("gh() { echo DISPATCH:\"$*\"; return \"$DISPATCH_RESULT\"; }\n"
                  + prefix + "\n" + body + "\n")
        env = {**os.environ, "REPO": "owner/repo", "DISPATCH_RESULT": str(dispatch_result)}
        return subprocess.run([BASH, "-c", script], text=True, capture_output=True, env=env, check=False)

    def test_no_merge_does_not_deploy(self):
        result = self.run_trap(":")
        self.assertEqual(result.returncode, 0)
        self.assertNotIn("DISPATCH:", result.stdout)

    def test_multiple_merges_dispatch_only_once(self):
        result = self.run_trap("merged=true\nmerged=true")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout.count("DISPATCH:workflow run deploy.yml --repo owner/repo --ref main"), 1)

    def test_failure_after_merge_still_dispatches_and_remains_failure(self):
        result = self.run_trap("merged=true\nfalse")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(result.stdout.count("DISPATCH:"), 1)

    def test_dispatch_failure_fails_job_loudly(self):
        result = self.run_trap("merged=true", dispatch_result=1)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("::error::Pages deploy dispatch failed", result.stdout)


if __name__ == "__main__":
    unittest.main()
